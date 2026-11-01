package com.aitarotreader.controllers;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.services.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.utils.ApiResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@Tag(name = "Mystic Profile", description = "Personal astrological, deck preference, and localization settings")
@RestController
@RequestMapping("/api/v1/profile/mystic")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final MysticProfileRepository mysticProfileRepository;
    private final ReadingSessionService readingSessionService;

    @Operation(summary = "Get current seeker's mystic profile and preferences")
    @GetMapping
    @Transactional
    public ResponseEntity<ApiResponse<MysticProfileDto>> getProfile(@AuthenticationPrincipal UUID userId) {
        UUID effectiveId = userId != null ? userId : ReadingSessionService.DEFAULT_SEEKER_ID;
        User user = readingSessionService.getOrCreateEffectiveUser(effectiveId);

        MysticProfile profile = mysticProfileRepository.findById(effectiveId)
                .orElseGet(() -> MysticProfile.builder()
                        .user(user)
                        .preferredDeckId("ED-01")
                        .preferredBackId("classic-navy")
                        .allowAiContext(true)
                        .build());

        return ResponseEntity.ok(ApiResponse.ok(toDto(profile, user.getLocale())));
    }

    @Operation(summary = "Update mystic profile, preferences, and language locale")
    @PutMapping
    @Transactional
    public ResponseEntity<ApiResponse<MysticProfileDto>> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody UpdateMysticProfileRequest request) {
        UUID effectiveId = userId != null ? userId : ReadingSessionService.DEFAULT_SEEKER_ID;
        User user = readingSessionService.getOrCreateEffectiveUser(effectiveId);

        if (request.getLocale() != null && !request.getLocale().isBlank()) {
            user.setLocale(request.getLocale());
            userRepository.save(user);
        }

        MysticProfile profile = mysticProfileRepository.findById(effectiveId)
                .orElseGet(() -> MysticProfile.builder().user(user).build());

        if (request.getBirthDate() != null) profile.setBirthDate(request.getBirthDate());
        if (request.getZodiacSign() != null) profile.setZodiacSign(request.getZodiacSign());
        if (request.getLifePathNumber() != null) profile.setLifePathNumber(request.getLifePathNumber());
        if (request.getPreferredDeckId() != null) profile.setPreferredDeckId(request.getPreferredDeckId());
        if (request.getPreferredBackId() != null) profile.setPreferredBackId(request.getPreferredBackId());
        if (request.getAllowAiContext() != null) profile.setAllowAiContext(request.getAllowAiContext());

        MysticProfile saved = mysticProfileRepository.save(profile);
        return ResponseEntity.ok(ApiResponse.ok("Mystic profile updated successfully", toDto(saved, user.getLocale())));
    }

    private MysticProfileDto toDto(MysticProfile profile, String locale) {
        return MysticProfileDto.builder()
                .userId(profile.getUserId())
                .birthDate(profile.getBirthDate())
                .zodiacSign(profile.getZodiacSign())
                .lifePathNumber(profile.getLifePathNumber())
                .preferredDeckId(profile.getPreferredDeckId())
                .preferredBackId(profile.getPreferredBackId())
                .allowAiContext(profile.getAllowAiContext())
                .locale(locale != null ? locale : "vi")
                .build();
    }
}
