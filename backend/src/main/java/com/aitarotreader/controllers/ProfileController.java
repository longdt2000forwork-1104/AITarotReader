package com.aitarotreader.controllers;

import com.aitarotreader.dtos.MysticProfileDto;
import com.aitarotreader.dtos.UpdateMysticProfileRequest;
import com.aitarotreader.entities.MysticProfile;
import com.aitarotreader.entities.User;
import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.repositories.MysticProfileRepository;
import com.aitarotreader.repositories.UserRepository;
import com.aitarotreader.utils.ApiResponse;
import com.aitarotreader.utils.NatalCalculationUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Tag(name = "Mystic Profile", description = "Personal astrological, deck preference, and localization settings")
@RestController
@RequestMapping("/api/v1/profile/mystic")
@RequiredArgsConstructor
public class ProfileController {

    private final UserRepository userRepository;
    private final MysticProfileRepository mysticProfileRepository;

    @Operation(summary = "Get current seeker's mystic profile and preferences")
    @GetMapping
    @Transactional
    public ResponseEntity<ApiResponse<MysticProfileDto>> getProfile(@AuthenticationPrincipal UUID userId) {
        User user = requireAuthenticatedUser(userId);

        MysticProfile profile = mysticProfileRepository.findById(user.getId())
                .orElseGet(() -> mysticProfileRepository.save(MysticProfile.builder()
                        .user(user)
                        .preferredDeckId("ED-01")
                        .preferredBackId("classic-navy")
                        .allowAiContext(true)
                        .build()));

        return ResponseEntity.ok(ApiResponse.ok(toDto(profile, user.getLocale())));
    }

    @Operation(summary = "Update mystic profile, preferences, and language locale")
    @PutMapping
    @Transactional
    public ResponseEntity<ApiResponse<MysticProfileDto>> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody UpdateMysticProfileRequest request) {
        User user = requireAuthenticatedUser(userId);

        if (request.getLocale() != null && !request.getLocale().isBlank()) {
            user.setLocale("en".equalsIgnoreCase(request.getLocale()) ? "en" : "vi");
            userRepository.save(user);
        }

        MysticProfile profile = mysticProfileRepository.findById(user.getId())
                .orElseGet(() -> MysticProfile.builder().user(user).build());

        if (request.getBirthDate() != null) {
            profile.setBirthDate(request.getBirthDate());
            profile.setZodiacSign(NatalCalculationUtil.computeZodiacSign(request.getBirthDate()));
            profile.setLifePathNumber(NatalCalculationUtil.computeLifePathNumber(request.getBirthDate()));
        } else {
            if (request.getZodiacSign() != null) profile.setZodiacSign(request.getZodiacSign());
            if (request.getLifePathNumber() != null) profile.setLifePathNumber(request.getLifePathNumber());
        }
        if (request.getPreferredDeckId() != null) profile.setPreferredDeckId(request.getPreferredDeckId());
        if (request.getPreferredBackId() != null) profile.setPreferredBackId(request.getPreferredBackId());
        if (request.getAllowAiContext() != null) profile.setAllowAiContext(request.getAllowAiContext());
        if (request.getFocusAreas() != null) {
            profile.setFocusAreas(String.join(",", request.getFocusAreas()));
        }

        MysticProfile saved = mysticProfileRepository.save(profile);
        return ResponseEntity.ok(ApiResponse.ok("Mystic profile updated successfully", toDto(saved, user.getLocale())));
    }

    private User requireAuthenticatedUser(UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED, "User not found"));
    }

    private MysticProfileDto toDto(MysticProfile profile, String locale) {
        List<String> focusList = (profile.getFocusAreas() != null && !profile.getFocusAreas().isBlank())
                ? Arrays.stream(profile.getFocusAreas().split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .toList()
                : Collections.emptyList();

        String zodiacSign = profile.getBirthDate() != null
                ? NatalCalculationUtil.computeZodiacSign(profile.getBirthDate())
                : profile.getZodiacSign();
        Integer lifePathNumber = profile.getBirthDate() != null
                ? NatalCalculationUtil.computeLifePathNumber(profile.getBirthDate())
                : profile.getLifePathNumber();

        return MysticProfileDto.builder()
                .userId(profile.getUserId())
                .birthDate(profile.getBirthDate())
                .zodiacSign(zodiacSign)
                .lifePathNumber(lifePathNumber)
                .preferredDeckId(profile.getPreferredDeckId())
                .preferredBackId(profile.getPreferredBackId())
                .allowAiContext(profile.getAllowAiContext())
                .focusAreas(focusList)
                .locale(locale != null ? locale : "vi")
                .build();
    }
}
