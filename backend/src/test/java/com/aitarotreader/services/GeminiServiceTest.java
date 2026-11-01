package com.aitarotreader.services;

import com.aitarotreader.entities.DrawnCard;
import com.aitarotreader.entities.ReadingSession;
import com.aitarotreader.entities.SpreadTemplate;
import com.aitarotreader.entities.TarotCard;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("supabase")
class GeminiServiceTest {

    @Autowired
    private GeminiService geminiService;

    @Test
    void testGeminiApiKeyAndTarotSynthesis() {
        assertThat(geminiService.isConfigured()).isTrue();

        TarotCard fool = TarotCard.builder()
                .id(0)
                .code("fool")
                .nameEn("The Fool")
                .nameVi("Kẻ Khờ")
                .keywordsUprightVi("Khởi đầu mới, ngây thơ, tự do, tiềm năng vô hạn")
                .keywordsReversedVi("Liều lĩnh, thiếu cân nhắc, ngây thơ mù quáng")
                .build();

        DrawnCard drawn = DrawnCard.builder()
                .card(fool)
                .positionIndex(0)
                .positionNameVi("Năng lượng trọng tâm")
                .positionNameEn("Focus Energy")
                .isReversed(false)
                .build();

        ReadingSession session = ReadingSession.builder()
                .userQuestion("Định hướng công việc mới trong tháng này")
                .spread(SpreadTemplate.builder().nameVi("Trải 1 Lá").nameEn("Single Card").build())
                .personaCode("MYSTIC_SAGE")
                .build();

        String result = geminiService.generateTarotSynthesis(session, List.of(drawn), "vi");

        System.out.println("=== GEMINI TAROT SYNTHESIS RESULT ===");
        System.out.println(result);

        assertThat(result).isNotNull();
        assertThat(result).isNotBlank();
        assertThat(result).containsAnyOf("Kẻ Khờ", "The Fool", "năng lượng", "khởi đầu");
    }
}
