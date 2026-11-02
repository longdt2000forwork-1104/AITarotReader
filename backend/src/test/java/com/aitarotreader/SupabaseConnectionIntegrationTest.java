package com.aitarotreader;

import com.aitarotreader.repositories.*;
import com.aitarotreader.entities.*;




import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("supabase")
class SupabaseConnectionIntegrationTest {

    @Autowired
    private TarotCardRepository cardRepository;

    @Autowired
    private TarotDeckRepository deckRepository;

    @Autowired
    private SpreadTemplateRepository spreadRepository;

    @Test
    void verifySupabaseConnectionAndCatalogSeed() {
        long deckCount = deckRepository.count();
        long spreadCount = spreadRepository.count();
        long cardCount = cardRepository.count();

        System.out.println("=== SUPABASE DATABASE VERIFICATION ===");
        System.out.println("Tarot Decks in Supabase: " + deckCount);
        System.out.println("Spread Templates in Supabase: " + spreadCount);
        System.out.println("Canonical Tarot Cards in Supabase: " + cardCount);

        assertThat(deckCount).isGreaterThanOrEqualTo(5);
        assertThat(spreadCount).isGreaterThanOrEqualTo(5);
        assertThat(cardCount).isGreaterThanOrEqualTo(78);
    }
}
