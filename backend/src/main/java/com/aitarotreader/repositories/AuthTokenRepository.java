package com.aitarotreader.repositories;

import com.aitarotreader.entities.AuthToken;
import com.aitarotreader.entities.AuthTokenType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AuthTokenRepository extends JpaRepository<AuthToken, UUID> {

    Optional<AuthToken> findByTokenHashAndType(String tokenHash, AuthTokenType type);

    @Modifying
    @Query("UPDATE AuthToken a SET a.usedAt = :usedAt WHERE a.user.id = :userId AND a.type = :type AND a.usedAt IS NULL")
    int invalidateActiveTokens(@Param("userId") UUID userId, @Param("type") AuthTokenType type, @Param("usedAt") Instant usedAt);
}
