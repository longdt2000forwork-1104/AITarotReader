package com.aitarotreader.modules.reading;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DrawnCardRepository extends JpaRepository<DrawnCard, UUID> {
    List<DrawnCard> findBySessionIdOrderByPositionIndexAsc(UUID sessionId);
}
