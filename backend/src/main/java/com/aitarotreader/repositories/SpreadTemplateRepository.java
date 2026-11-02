package com.aitarotreader.repositories;

import com.aitarotreader.entities.*;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SpreadTemplateRepository extends JpaRepository<SpreadTemplate, String> {
    Optional<SpreadTemplate> findByCode(String code);
}
