package com.aitarotreader.repositories;

import com.aitarotreader.entities.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface ReadingSessionRepository extends JpaRepository<ReadingSession, UUID> {
    Page<ReadingSession> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
    List<ReadingSession> findByUserIdAndCreatedAtAfter(UUID userId, Instant after);
}
