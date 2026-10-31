package com.aitarotreader.modules.tarot;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TarotCardRepository extends JpaRepository<TarotCard, Integer> {
    Optional<TarotCard> findByCode(String code);
    List<TarotCard> findByArcana(Arcana arcana);
    List<TarotCard> findBySuit(Suit suit);
}
