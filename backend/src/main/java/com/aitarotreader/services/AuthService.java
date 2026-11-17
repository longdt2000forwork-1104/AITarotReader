package com.aitarotreader.services;

import com.aitarotreader.dtos.*;
import com.aitarotreader.entities.*;
import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.repositories.AuthTokenRepository;
import com.aitarotreader.repositories.MysticProfileRepository;
import com.aitarotreader.repositories.RefreshTokenRepository;
import com.aitarotreader.repositories.UserRepository;
import com.aitarotreader.utils.JwtTokenProvider;
import com.aitarotreader.utils.NatalCalculationUtil;
import com.aitarotreader.utils.TokenHashUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private static final long VERIFY_EMAIL_HOURS = 24;
    private static final long RESET_PASSWORD_MINUTES = 30;

    private final UserRepository userRepository;
    private final MysticProfileRepository mysticProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthTokenRepository authTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleTokenVerifierService googleTokenVerifierService;
    private final EmailService emailService;
    private final AuthRateLimiterService rateLimiterService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());
        if (userRepository.existsByEmail(email)) {
            throw new CustomException(ErrorCode.USER_ALREADY_EXISTS);
        }

        String locale = normalizeLocale(request.getLocale());
        User user = User.builder()
                .email(email)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getDisplayName().trim())
                .locale(locale)
                .emailVerified(false)
                .crystalBalance(20)
                .tier(UserTier.FREE)
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);

        String focusAreasStr = (request.getFocusAreas() != null && !request.getFocusAreas().isEmpty())
                ? String.join(",", request.getFocusAreas())
                : null;

        MysticProfile profile = MysticProfile.builder()
                .user(user)
                .birthDate(request.getBirthDate())
                .zodiacSign(NatalCalculationUtil.computeZodiacSign(request.getBirthDate()))
                .lifePathNumber(NatalCalculationUtil.computeLifePathNumber(request.getBirthDate()))
                .preferredDeckId("ED-01")
                .preferredBackId("classic-navy")
                .allowAiContext(request.getAllowAiContext() != null ? request.getAllowAiContext() : true)
                .focusAreas(focusAreasStr)
                .build();
        mysticProfileRepository.save(profile);

        String rawToken = issueAuthToken(user, AuthTokenType.VERIFY_EMAIL, Instant.now().plus(VERIFY_EMAIL_HOURS, ChronoUnit.HOURS));
        emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawToken, locale, request.getPlatform());

        return AuthResponse.builder()
                .requiresVerification(true)
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String clientIp, String userAgent) {
        String email = normalizeEmail(request.getEmail());
        rateLimiterService.checkLoginLimit(clientIp, email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        if (!Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new CustomException(ErrorCode.EMAIL_NOT_VERIFIED,
                    "Please verify your email address before signing in.");
        }

        user.setLastLoginAt(Instant.now());
        user = userRepository.save(user);

        return issueSessionTokens(user, userAgent);
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request, String userAgent) {
        GoogleTokenVerifierService.GoogleUserPayload googleUser = googleTokenVerifierService.verify(request.getIdToken());

        User user = userRepository.findByGoogleSub(googleUser.sub()).orElse(null);

        if (user == null) {
            user = userRepository.findByEmail(googleUser.email()).orElse(null);
            if (user != null) {
                // Safe Google linking rule: if an existing unverified email account exists,
                // clear its password_hash to prevent pre-hijacking by an attacker.
                if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                    user.setPasswordHash(null);
                }
                user.setEmailVerified(true);
                user.setGoogleSub(googleUser.sub());
                if ((user.getFullName() == null || user.getFullName().isBlank()) && googleUser.name() != null) {
                    user.setFullName(googleUser.name());
                }
                if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && googleUser.picture() != null) {
                    user.setAvatarUrl(googleUser.picture());
                }
            } else {
                String locale = normalizeLocale(request.getLocale());
                User newUser = User.builder()
                        .email(googleUser.email())
                        .googleSub(googleUser.sub())
                        .emailVerified(true)
                        .fullName(googleUser.name() != null && !googleUser.name().isBlank() ? googleUser.name() : "Seeker")
                        .avatarUrl(googleUser.picture())
                        .crystalBalance(20)
                        .tier(UserTier.FREE)
                        .role(UserRole.USER)
                        .locale(locale)
                        .build();
                user = userRepository.save(newUser);

                MysticProfile profile = MysticProfile.builder()
                        .user(user)
                        .preferredDeckId("ED-01")
                        .preferredBackId("classic-navy")
                        .allowAiContext(true)
                        .build();
                mysticProfileRepository.save(profile);
            }
        } else {
            if ((user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) && googleUser.picture() != null) {
                user.setAvatarUrl(googleUser.picture());
            }
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                user.setEmailVerified(true);
            }
        }

        user.setLastLoginAt(Instant.now());
        user = userRepository.save(user);

        return issueSessionTokens(user, userAgent);
    }

    @Transactional
    public void verifyEmail(VerifyEmailRequest request) {
        String tokenHash = TokenHashUtil.sha256Hex(request.getToken().trim());
        AuthToken authToken = authTokenRepository.findByTokenHashAndType(tokenHash, AuthTokenType.VERIFY_EMAIL)
                .orElseThrow(() -> new CustomException(ErrorCode.TOKEN_EXPIRED_OR_USED));

        Instant now = Instant.now();
        if (authToken.getUsedAt() != null || authToken.getExpiresAt().isBefore(now)) {
            throw new CustomException(ErrorCode.TOKEN_EXPIRED_OR_USED);
        }

        authToken.setUsedAt(now);
        authTokenRepository.save(authToken);

        User user = authToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerification(ResendVerificationRequest request, String clientIp) {
        String email = normalizeEmail(request.getEmail());
        rateLimiterService.checkResendVerificationLimit(clientIp, email);

        userRepository.findByEmail(email).ifPresent(user -> {
            if (!Boolean.TRUE.equals(user.getEmailVerified())) {
                authTokenRepository.invalidateActiveTokens(user.getId(), AuthTokenType.VERIFY_EMAIL, Instant.now());
                String rawToken = issueAuthToken(user, AuthTokenType.VERIFY_EMAIL,
                        Instant.now().plus(VERIFY_EMAIL_HOURS, ChronoUnit.HOURS));
                String locale = request.getLocale() != null && !request.getLocale().isBlank()
                        ? normalizeLocale(request.getLocale())
                        : user.getLocale();
                emailService.sendVerificationEmail(user.getEmail(), user.getFullName(), rawToken, locale, request.getPlatform());
            }
        });
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request, String clientIp) {
        String email = normalizeEmail(request.getEmail());
        rateLimiterService.checkForgotPasswordLimit(clientIp, email);

        userRepository.findByEmail(email).ifPresent(user -> {
            authTokenRepository.invalidateActiveTokens(user.getId(), AuthTokenType.RESET_PASSWORD, Instant.now());
            String rawToken = issueAuthToken(user, AuthTokenType.RESET_PASSWORD,
                    Instant.now().plus(RESET_PASSWORD_MINUTES, ChronoUnit.MINUTES));
            String locale = request.getLocale() != null && !request.getLocale().isBlank()
                    ? normalizeLocale(request.getLocale())
                    : user.getLocale();
            emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), rawToken, locale, request.getPlatform());
        });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String tokenHash = TokenHashUtil.sha256Hex(request.getToken().trim());
        AuthToken authToken = authTokenRepository.findByTokenHashAndType(tokenHash, AuthTokenType.RESET_PASSWORD)
                .orElseThrow(() -> new CustomException(ErrorCode.TOKEN_EXPIRED_OR_USED));

        Instant now = Instant.now();
        if (authToken.getUsedAt() != null || authToken.getExpiresAt().isBefore(now)) {
            throw new CustomException(ErrorCode.TOKEN_EXPIRED_OR_USED);
        }

        authToken.setUsedAt(now);
        authTokenRepository.save(authToken);

        User user = authToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setEmailVerified(true);
        userRepository.save(user);

        // Revoke all existing refresh tokens when password is reset
        refreshTokenRepository.revokeAllActiveByUserId(user.getId(), now);
    }

    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request, String userAgent) {
        String tokenHash = TokenHashUtil.sha256Hex(request.getRefreshToken().trim());
        RefreshToken existing = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new CustomException(ErrorCode.REFRESH_TOKEN_INVALID));

        Instant now = Instant.now();
        if (existing.getRevokedAt() != null) {
            // Reuse of a revoked refresh token: revoke all active sessions for safety
            refreshTokenRepository.revokeAllActiveByUserId(existing.getUser().getId(), now);
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }
        if (existing.getExpiresAt().isBefore(now)) {
            throw new CustomException(ErrorCode.REFRESH_TOKEN_INVALID);
        }

        existing.setRevokedAt(now);
        refreshTokenRepository.save(existing);

        User user = existing.getUser();
        return issueSessionTokens(user, userAgent);
    }

    @Transactional
    public void logout(LogoutRequest request) {
        if (request == null || request.getRefreshToken() == null || request.getRefreshToken().isBlank()) {
            return;
        }
        String tokenHash = TokenHashUtil.sha256Hex(request.getRefreshToken().trim());
        refreshTokenRepository.findByTokenHash(tokenHash).ifPresent(rt -> {
            if (rt.getRevokedAt() == null) {
                rt.setRevokedAt(Instant.now());
                refreshTokenRepository.save(rt);
            }
        });
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED, "User not found"));
        return toUserDto(user);
    }

    public UserDto toUserDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .locale(user.getLocale())
                .crystalBalance(user.getCrystalBalance())
                .tier(user.getTier())
                .role(user.getRole())
                .avatarUrl(user.getAvatarUrl())
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .hasPassword(user.getPasswordHash() != null && !user.getPasswordHash().isBlank())
                .hasGoogle(user.getGoogleSub() != null && !user.getGoogleSub().isBlank())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AuthResponse issueSessionTokens(User user, String userAgent) {
        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String rawRefreshToken = TokenHashUtil.generateSecureToken();
        String refreshHash = TokenHashUtil.sha256Hex(rawRefreshToken);

        String trimmedAgent = userAgent != null && userAgent.length() > 500
                ? userAgent.substring(0, 500)
                : userAgent;

        RefreshToken refreshEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(refreshHash)
                .expiresAt(Instant.now().plusMillis(jwtTokenProvider.getRefreshExpirationMs()))
                .userAgent(trimmedAgent)
                .build();
        refreshTokenRepository.save(refreshEntity);

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(accessToken)
                .refreshToken(rawRefreshToken)
                .expiresInSeconds(jwtTokenProvider.getExpirationSeconds())
                .requiresVerification(false)
                .user(toUserDto(user))
                .build();
    }

    private String issueAuthToken(User user, AuthTokenType type, Instant expiresAt) {
        String rawToken = TokenHashUtil.generateSecureToken();
        AuthToken tokenEntity = AuthToken.builder()
                .user(user)
                .type(type)
                .tokenHash(TokenHashUtil.sha256Hex(rawToken))
                .expiresAt(expiresAt)
                .build();
        authTokenRepository.save(tokenEntity);
        return rawToken;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizeLocale(String locale) {
        return "en".equalsIgnoreCase(locale) ? "en" : "vi";
    }
}
