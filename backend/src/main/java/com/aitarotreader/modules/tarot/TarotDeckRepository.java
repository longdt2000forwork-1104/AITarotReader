package com.aitarotreader.modules.tarot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarotDeckRepository extends JpaRepository<TarotDeck, String> {
    Optional<TarotDeck> findBySlug(String slug);
    List<TarotDeck> findByIsActiveTrue();
}
