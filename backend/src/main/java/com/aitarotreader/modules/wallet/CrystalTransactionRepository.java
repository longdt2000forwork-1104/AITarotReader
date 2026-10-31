package com.aitarotreader.modules.wallet;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CrystalTransactionRepository extends JpaRepository<CrystalTransaction, UUID> {
    Page<CrystalTransaction> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);
}
