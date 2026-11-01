package com.aitarotreader.repositories;

import com.aitarotreader.entities.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SessionMessageRepository extends JpaRepository<SessionMessage, UUID> {
    List<SessionMessage> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
