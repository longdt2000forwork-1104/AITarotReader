package com.aitarotreader.modules.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MysticProfileRepository extends JpaRepository<MysticProfile, UUID> {
}
