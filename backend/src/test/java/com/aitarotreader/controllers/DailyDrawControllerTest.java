package com.aitarotreader.controllers;

import com.aitarotreader.entities.MysticProfile;
import com.aitarotreader.entities.User;
import com.aitarotreader.entities.UserRole;
import com.aitarotreader.entities.UserTier;
import com.aitarotreader.repositories.MysticProfileRepository;
import com.aitarotreader.repositories.UserRepository;
import com.aitarotreader.utils.JwtTokenProvider;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.support.TransactionTemplate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("supabase")
class DailyDrawControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MysticProfileRepository mysticProfileRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private TransactionTemplate transactionTemplate;

    private User testUser;

    @AfterEach
    void tearDown() {
        if (testUser != null) {
            userRepository.findById(testUser.getId()).ifPresent(userRepository::delete);
            testUser = null;
        }
    }

    @Test
    void testDailyDrawRequiresAuthenticationAndWorksForVerifiedUser() throws Exception {
        mockMvc.perform(post("/api/v1/readings/daily")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());

        testUser = transactionTemplate.execute(status -> {
            User saved = userRepository.save(User.builder()
                    .email("daily_test_" + System.nanoTime() + "@example.com")
                    .fullName("Daily Tester")
                    .locale("vi")
                    .emailVerified(true)
                    .crystalBalance(20)
                    .tier(UserTier.FREE)
                    .role(UserRole.USER)
                    .build());

            mysticProfileRepository.save(MysticProfile.builder()
                    .user(saved)
                    .preferredDeckId("ED-01")
                    .preferredBackId("classic-navy")
                    .allowAiContext(true)
                    .build());
            return saved;
        });

        String token = jwtTokenProvider.generateToken(testUser.getId(), testUser.getEmail(), testUser.getRole().name());

        mockMvc.perform(post("/api/v1/readings/daily")
                        .header("Authorization", "Bearer " + token)
                        .param("locale", "vi")
                        .param("force", "true")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.drawnCards").isArray())
                .andExpect(jsonPath("$.data.drawnCards[0].card.nameVi").exists());
    }
}
