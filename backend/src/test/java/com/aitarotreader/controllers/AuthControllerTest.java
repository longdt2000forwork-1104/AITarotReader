package com.aitarotreader.controllers;

import com.aitarotreader.dtos.*;
import com.aitarotreader.entities.AuthToken;
import com.aitarotreader.entities.AuthTokenType;
import com.aitarotreader.entities.User;
import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.repositories.AuthTokenRepository;
import com.aitarotreader.repositories.UserRepository;
import com.aitarotreader.services.AuthRateLimiterService;
import com.aitarotreader.services.GoogleTokenVerifierService;
import com.aitarotreader.utils.TokenHashUtil;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.mail.Multipart;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Properties;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("supabase")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthTokenRepository authTokenRepository;

    @Autowired
    private AuthRateLimiterService rateLimiterService;

    @MockBean
    private JavaMailSender mailSender;

    @MockBean
    private GoogleTokenVerifierService googleTokenVerifierService;

    private final List<String> createdEmails = new ArrayList<>();

    @BeforeEach
    void setUp() {
        rateLimiterService.clearAll();
        when(mailSender.createMimeMessage()).thenAnswer(inv -> new MimeMessage(Session.getInstance(new Properties())));
    }

    @AfterEach
    void tearDown() {
        for (String email : createdEmails) {
            userRepository.findByEmail(email).ifPresent(userRepository::delete);
        }
        createdEmails.clear();
    }

    private String uniqueEmail(String prefix) {
        String email = prefix + "_" + System.nanoTime() + "@example.com";
        createdEmails.add(email.toLowerCase());
        return email;
    }

    private String extractBodyText(Object content) throws Exception {
        if (content instanceof String str) {
            return str;
        }
        if (content instanceof Multipart mp) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < mp.getCount(); i++) {
                sb.append(extractBodyText(mp.getBodyPart(i).getContent()));
            }
            return sb.toString();
        }
        return content != null ? content.toString() : "";
    }

    private String extractTokenFromSentEmail(MimeMessage msg) throws Exception {
        String body = extractBodyText(msg.getContent());
        Matcher m = Pattern.compile("token=([^\"&\\s<>]+)").matcher(body);
        assertThat(m.find()).isTrue();
        return URLDecoder.decode(m.group(1), StandardCharsets.UTF_8);
    }

    @Test
    void testProtectedEndpointsReturn401WhenUnauthenticated() throws Exception {
        mockMvc.perform(get("/api/v1/auth/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("ERR_UNAUTHORIZED"));

        mockMvc.perform(get("/api/v1/readings/daily"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/readings/sessions"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/profile/mystic"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/v1/wallet/balance"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void testRegisterVerifyLoginAndDuplicateEmailFlow() throws Exception {
        String email = uniqueEmail("verify_flow");

        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password("StrongPass123!")
                .displayName("Aria Seeker")
                .birthDate(LocalDate.of(1998, 4, 12))
                .focusAreas(List.of("Creative Ideation", "Career & Strategy"))
                .locale("vi")
                .platform("web")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.requiresVerification").value(true))
                .andExpect(jsonPath("$.data.accessToken").doesNotExist())
                .andExpect(jsonPath("$.data.user.email").value(email))
                .andExpect(jsonPath("$.data.user.emailVerified").value(false));

        // Duplicate email registration must return 409
        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode").value("ERR_USER_EXISTS"));

        // Login before email verification must be rejected (403 ERR_EMAIL_NOT_VERIFIED)
        LoginRequest loginReq = LoginRequest.builder()
                .email(email)
                .password("StrongPass123!")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode").value("ERR_EMAIL_NOT_VERIFIED"));

        // Extract verification token from captured email
        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(captor.capture());
        String verifyToken = extractTokenFromSentEmail(captor.getValue());

        // Verify email
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyEmailRequest(verifyToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        // Reusing verification token must fail with 400 ERR_TOKEN_EXPIRED_OR_USED
        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyEmailRequest(verifyToken))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("ERR_TOKEN_EXPIRED_OR_USED"));

        // Login after verification succeeds and returns accessToken + refreshToken
        MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andExpect(jsonPath("$.data.user.emailVerified").value(true))
                .andExpect(jsonPath("$.data.user.hasPassword").value(true))
                .andExpect(jsonPath("$.data.user.hasGoogle").value(false))
                .andReturn();

        JsonNode loginJson = objectMapper.readTree(loginRes.getResponse().getContentAsString());
        String accessToken = loginJson.get("data").get("accessToken").asText();
        String refreshToken = loginJson.get("data").get("refreshToken").asText();

        // /me works with Bearer token
        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(email));

        // Refresh rotates token; reusing old refresh token fails
        MvcResult refreshRes = mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.refreshToken").isString())
                .andReturn();

        String rotatedRefresh = objectMapper.readTree(refreshRes.getResponse().getContentAsString())
                .get("data").get("refreshToken").asText();
        assertThat(rotatedRefresh).isNotEqualTo(refreshToken);

        // Old refresh token is now invalid
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(refreshToken))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("ERR_REFRESH_TOKEN_INVALID"));
    }

    @Test
    void testExpiredVerifyTokenIsRejected() throws Exception {
        String email = uniqueEmail("expired_tok");

        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password("StrongPass123!")
                .displayName("Expired Tester")
                .locale("en")
                .platform("app")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail(email).orElseThrow();
        String rawExpired = TokenHashUtil.generateSecureToken();
        AuthToken expiredToken = AuthToken.builder()
                .user(user)
                .type(AuthTokenType.VERIFY_EMAIL)
                .tokenHash(TokenHashUtil.sha256Hex(rawExpired))
                .expiresAt(Instant.now().minus(5, ChronoUnit.MINUTES))
                .build();
        authTokenRepository.save(expiredToken);

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyEmailRequest(rawExpired))))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("ERR_TOKEN_EXPIRED_OR_USED"));
    }

    @Test
    void testGoogleRejectsFakeTokenAndLinksUnverifiedEmailSafely() throws Exception {
        when(googleTokenVerifierService.verify("fake-token"))
                .thenThrow(new CustomException(ErrorCode.INVALID_GOOGLE_TOKEN));

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(GoogleAuthRequest.builder()
                                .idToken("fake-token")
                                .platform("web")
                                .build())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("ERR_INVALID_GOOGLE_TOKEN"));

        // Pre-register an unverified email account (simulating pre-hijack attempt)
        String email = uniqueEmail("google_link");
        RegisterRequest registerReq = RegisterRequest.builder()
                .email(email)
                .password("AttackerPass123!")
                .displayName("Original")
                .locale("vi")
                .platform("web")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated());

        // Real Google user signs in with same email
        when(googleTokenVerifierService.verify("valid-google-token"))
                .thenReturn(new GoogleTokenVerifierService.GoogleUserPayload(
                        "google-sub-" + System.nanoTime(),
                        email,
                        true,
                        "Google Verified User",
                        "https://example.com/avatar.png"
                ));

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(GoogleAuthRequest.builder()
                                .idToken("valid-google-token")
                                .platform("web")
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString())
                .andExpect(jsonPath("$.data.user.emailVerified").value(true))
                .andExpect(jsonPath("$.data.user.hasGoogle").value(true))
                .andExpect(jsonPath("$.data.user.hasPassword").value(false));

        // Attacker's old password was cleared and cannot be used to log in
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "AttackerPass123!"))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("ERR_INVALID_CREDENTIALS"));
    }

    @Test
    void testForgotAndResetPasswordRevokesOldRefreshTokens() throws Exception {
        String email = uniqueEmail("reset_pwd");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(RegisterRequest.builder()
                                .email(email)
                                .password("OldPassword123!")
                                .displayName("Reset Seeker")
                                .locale("vi")
                                .platform("web")
                                .build())))
                .andExpect(status().isCreated());

        ArgumentCaptor<MimeMessage> captor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(1)).send(captor.capture());
        String verifyToken = extractTokenFromSentEmail(captor.getValue());

        mockMvc.perform(post("/api/v1/auth/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new VerifyEmailRequest(verifyToken))))
                .andExpect(status().isOk());

        MvcResult loginRes = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "OldPassword123!"))))
                .andExpect(status().isOk())
                .andReturn();

        String oldRefreshToken = objectMapper.readTree(loginRes.getResponse().getContentAsString())
                .get("data").get("refreshToken").asText();

        // Non-existent email also returns 200 generic response
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ForgotPasswordRequest.builder()
                                .email("nonexistent_" + System.nanoTime() + "@example.com")
                                .platform("web")
                                .build())))
                .andExpect(status().isOk());

        // Existing email gets reset email
        mockMvc.perform(post("/api/v1/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(ForgotPasswordRequest.builder()
                                .email(email)
                                .platform("app")
                                .build())))
                .andExpect(status().isOk());

        ArgumentCaptor<MimeMessage> resetCaptor = ArgumentCaptor.forClass(MimeMessage.class);
        verify(mailSender, times(2)).send(resetCaptor.capture());
        String resetToken = extractTokenFromSentEmail(resetCaptor.getAllValues().get(1));

        mockMvc.perform(post("/api/v1/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new ResetPasswordRequest(resetToken, "NewStrongPass456!"))))
                .andExpect(status().isOk());

        // Old refresh token was revoked
        mockMvc.perform(post("/api/v1/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new RefreshTokenRequest(oldRefreshToken))))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.errorCode").value("ERR_REFRESH_TOKEN_INVALID"));

        // Old password fails, new password succeeds
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "OldPassword123!"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest(email, "NewStrongPass456!"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isString());
    }
}
