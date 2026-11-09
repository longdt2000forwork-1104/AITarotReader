package com.aitarotreader.config;

import com.aitarotreader.repositories.TarotCardRepository;
import com.aitarotreader.repositories.TarotDeckRepository;
import com.aitarotreader.repositories.SpreadTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class DatabaseDataInitializer implements CommandLineRunner {

    private final TarotCardRepository cardRepository;
    private final TarotDeckRepository deckRepository;
    private final SpreadTemplateRepository spreadRepository;
    private final DataSource dataSource;

    @Override
    public void run(String... args) {
        long cardCount = cardRepository.count();
        long deckCount = deckRepository.count();
        long spreadCount = spreadRepository.count();

        log.info("Checking Supabase Tarot Catalog status... Current cards: {}, decks: {}, spreads: {}",
                cardCount, deckCount, spreadCount);

        if (cardCount == 0 || deckCount == 0 || spreadCount == 0) {
            log.info("Supabase catalog is incomplete or empty. Seeding tarot catalog and initial data...");
            try {
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.setSqlScriptEncoding(StandardCharsets.UTF_8.name());
                populator.setContinueOnError(true);

                populator.addScript(new ClassPathResource("db/migration/V2__seed_tarot_catalog.sql"));
                populator.addScript(new ClassPathResource("db/migration/V3__seed_minor_arcana.sql"));
                populator.addScript(new ClassPathResource("db/migration/V4__seed_default_user.sql"));

                populator.execute(dataSource);
                log.info("Supabase catalog seeding completed! Total cards: {}, decks: {}, spreads: {}",
                        cardRepository.count(), deckRepository.count(), spreadRepository.count());
            } catch (Exception e) {
                log.error("Failed to seed tarot catalog into Supabase: {}", e.getMessage(), e);
            }
        } else {
            log.info("Supabase Tarot catalog already initialized (cards: {}, decks: {}, spreads: {}).",
                    cardCount, deckCount, spreadCount);
        }
    }
}
