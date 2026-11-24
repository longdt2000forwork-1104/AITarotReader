package com.aitarotreader.controllers;

import com.aitarotreader.entities.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.services.GeminiService;
import com.aitarotreader.services.ReadingSessionService;
import com.aitarotreader.utils.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("supabase")
class ReadingSessionChatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MysticProfileRepository mysticProfileRepository;

    @Autowired
    private ReadingSessionRepository readingSessionRepository;

    @Autowired
    private DrawnCardRepository drawnCardRepository;

    @Autowired
    private SessionMessageRepository sessionMessageRepository;

    @Autowired
    private SpreadTemplateRepository spreadTemplateRepository;

    @Autowired
    private TarotDeckRepository tarotDeckRepository;

    @Autowired
    private TarotCardRepository tarotCardRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @MockBean
    private GeminiService geminiService;

    private User testUser;
    private final List<UUID> createdSessionIds = new ArrayList<>();

    @BeforeEach
    void setUp() {
        when(geminiService.isConfigured()).thenReturn(false);
    }

    @AfterEach
    void tearDown() {
        transactionTemplate.executeWithoutResult(status -> {
            for (UUID sessionId : createdSessionIds) {
                readingSessionRepository.findById(sessionId).ifPresent(readingSessionRepository::delete);
            }
            createdSessionIds.clear();
            if (testUser != null) {
                userRepository.findById(testUser.getId()).ifPresent(userRepository::delete);
                testUser = null;
            }
        });
    }

    @Test
    void testPastSessionChatIsRejectedAndTodaySessionChatIsAllowed() throws Exception {
        UUID[] sessionIds = transactionTemplate.execute(status -> {
            testUser = userRepository.save(User.builder()
                    .email("chat_date_test_" + System.nanoTime() + "@example.com")
                    .fullName("Chat Date Tester")
                    .locale("vi")
                    .emailVerified(true)
                    .crystalBalance(20)
                    .tier(UserTier.FREE)
                    .role(UserRole.USER)
                    .build());

            mysticProfileRepository.save(MysticProfile.builder()
                    .user(testUser)
                    .preferredDeckId("ED-01")
                    .preferredBackId("classic-navy")
                    .allowAiContext(true)
                    .build());

            SpreadTemplate spread = spreadTemplateRepository.findById("S-01")
                    .orElseGet(() -> spreadTemplateRepository.findAll().stream().findFirst().orElseThrow());
            TarotDeck deck = tarotDeckRepository.findById("ED-01").orElse(null);
            TarotCard card = tarotCardRepository.findById(0)
                    .orElseGet(() -> tarotCardRepository.findAll().stream().findFirst().orElseThrow());

            ReadingSession pastSession = readingSessionRepository.save(ReadingSession.builder()
                    .user(testUser)
                    .spread(spread)
                    .deck(deck)
                    .inputMode(InputMode.VIRTUAL)
                    .personaCode("MYSTIC_SAGE")
                    .userQuestion("Past session question")
                    .aiSynthesisResult("Past synthesis content")
                    .followUpCount(0)
                    .maxFollowUps(10)
                    .status("COMPLETED")
                    .build());

            drawnCardRepository.save(DrawnCard.builder()
                    .session(pastSession)
                    .card(card)
                    .positionIndex(0)
                    .positionNameEn("Daily Focus")
                    .positionNameVi("Năng lượng trọng tâm")
                    .isReversed(false)
                    .isClarifier(false)
                    .build());

            ReadingSession todaySession = readingSessionRepository.save(ReadingSession.builder()
                    .user(testUser)
                    .spread(spread)
                    .deck(deck)
                    .inputMode(InputMode.VIRTUAL)
                    .personaCode("MYSTIC_SAGE")
                    .userQuestion("Today session question")
                    .aiSynthesisResult("Today synthesis content")
                    .followUpCount(0)
                    .maxFollowUps(10)
                    .status("COMPLETED")
                    .build());

            drawnCardRepository.save(DrawnCard.builder()
                    .session(todaySession)
                    .card(card)
                    .positionIndex(0)
                    .positionNameEn("Daily Focus")
                    .positionNameVi("Năng lượng trọng tâm")
                    .isReversed(false)
                    .isClarifier(false)
                    .build());

            createdSessionIds.add(pastSession.getId());
            createdSessionIds.add(todaySession.getId());

            return new UUID[]{pastSession.getId(), todaySession.getId()};
        });

        assertThat(sessionIds).isNotNull();
        UUID pastSessionId = sessionIds[0];
        UUID todaySessionId = sessionIds[1];

        Instant yesterdayNoon = LocalDate.now(ReadingSessionService.VIETNAM_ZONE)
                .minusDays(1)
                .atTime(12, 0)
                .atZone(ReadingSessionService.VIETNAM_ZONE)
                .toInstant();

        int updatedRows = jdbcTemplate.update(
                "UPDATE reading_sessions SET created_at = ? WHERE id = ?",
                Timestamp.from(yesterdayNoon),
                pastSessionId
        );
        assertThat(updatedRows).isEqualTo(1);

        String token = jwtTokenProvider.generateToken(testUser.getId(), testUser.getEmail(), testUser.getRole().name());

        mockMvc.perform(get("/api/v1/readings/sessions/{id}", pastSessionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isTodaySession").value(false));

        mockMvc.perform(post("/api/v1/readings/sessions/{id}/chat", pastSessionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"Test past question\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errorCode").value("ERR_PAST_SESSION_READ_ONLY"));

        assertThat(sessionMessageRepository.findBySessionIdOrderByCreatedAtAsc(pastSessionId)).isEmpty();

        mockMvc.perform(get("/api/v1/readings/sessions/{id}", todaySessionId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isTodaySession").value(true));

        mockMvc.perform(post("/api/v1/readings/sessions/{id}/chat", todaySessionId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"question\":\"Test today question\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isTodaySession").value(true))
                .andExpect(jsonPath("$.data.messages.length()").value(2));
    }
}
