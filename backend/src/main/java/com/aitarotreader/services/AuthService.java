package com.aitarotreader.services;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.utils.JwtTokenProvider;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final MysticProfileRepository mysticProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().toLowerCase())) {
            throw new CustomException(ErrorCode.USER_ALREADY_EXISTS);
        }

        User user = User.builder()
                .email(request.getEmail().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .locale(request.getLocale() != null ? request.getLocale() : "vi")
                .crystalBalance(20)
                .tier(UserTier.FREE)
                .role(UserRole.USER)
                .build();

        user = userRepository.save(user);

        MysticProfile profile = MysticProfile.builder()
                .user(user)
                .preferredDeckId("ED-01")
                .preferredBackId("classic-navy")
                .allowAiContext(true)
                .build();
        mysticProfileRepository.save(profile);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(token)
                .user(toUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase())
                .orElseThrow(() -> new CustomException(ErrorCode.INVALID_CREDENTIALS));

        if (user.getPasswordHash() == null || !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(ErrorCode.INVALID_CREDENTIALS);
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(token)
                .user(toUserDto(user))
                .build();
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleAuthRequest request) {
        String email = request.getEmail() != null ? request.getEmail().toLowerCase() : "seeker@aitarotreader.com";
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = User.builder()
                    .email(email)
                    .fullName(request.getName() != null ? request.getName() : "Seeker")
                    .avatarUrl(request.getPicture())
                    .crystalBalance(20)
                    .tier(UserTier.FREE)
                    .role(UserRole.USER)
                    .locale("vi")
                    .build();
            User saved = userRepository.save(newUser);

            MysticProfile profile = MysticProfile.builder()
                    .user(saved)
                    .preferredDeckId("ED-01")
                    .preferredBackId("classic-navy")
                    .allowAiContext(true)
                    .build();
            mysticProfileRepository.save(profile);
            return saved;
        });

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());

        return AuthResponse.builder()
                .tokenType("Bearer")
                .accessToken(token)
                .user(toUserDto(user))
                .build();
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));
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
                .build();
    }
}
