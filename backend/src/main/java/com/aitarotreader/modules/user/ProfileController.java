package com.aitarotreader.modules.user;

import com.aitarotreader.common.ApiResponse;
import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
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

    @Operation(summary = "Get current seeker's mystic profile and preferences")
    @GetMapping
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<MysticProfileDto>> getProfile(@AuthenticationPrincipal UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));

        MysticProfile profile = mysticProfileRepository.findById(userId)
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
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));

        if (request.getLocale() != null && !request.getLocale().isBlank()) {
            user.setLocale(request.getLocale());
            userRepository.save(user);
        }

        MysticProfile profile = mysticProfileRepository.findById(userId)
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
                .locale(locale)
                .build();
    }
}
