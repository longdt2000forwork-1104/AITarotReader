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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;
import java.util.UUID;

@Tag(name = "Wallet & Crystals", description = "Crystal balance and immutable credit ledger transactions")
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final ReadingSessionService readingSessionService;

    @Operation(summary = "Get current seeker's Crystal balance")
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance(@AuthenticationPrincipal UUID userId) {
        UUID effectiveId = userId != null ? userId : ReadingSessionService.DEFAULT_SEEKER_ID;
        readingSessionService.getOrCreateEffectiveUser(effectiveId);
        Integer balance = walletService.getBalance(effectiveId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "userId", effectiveId,
                "balance", balance,
                "crystalBalance", balance,
                "tier", "FREE",
                "dailyFreeAvailable", true
        )));
    }

    @Operation(summary = "Claim daily login crystal reward (+10 Crystals)")
    @PostMapping("/daily-reward")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimDailyReward(@AuthenticationPrincipal UUID userId) {
        UUID effectiveId = userId != null ? userId : ReadingSessionService.DEFAULT_SEEKER_ID;
        readingSessionService.getOrCreateEffectiveUser(effectiveId);
        walletService.creditCrystals(effectiveId, 10, "DAILY_REWARD", "daily-" + LocalDate.now(), "Daily Dawn Login Blessing");
        Integer balance = walletService.getBalance(effectiveId);
        return ResponseEntity.ok(ApiResponse.ok("Daily reward claimed (+10 Crystals)", Map.of(
                "userId", effectiveId,
                "balance", balance,
                "crystalBalance", balance,
                "tier", "FREE",
                "dailyFreeAvailable", false
        )));
    }

    @Operation(summary = "Get immutable Crystal ledger history")
    @GetMapping("/ledger")
    public ResponseEntity<ApiResponse<Page<CrystalTransaction>>> getLedger(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID effectiveId = userId != null ? userId : ReadingSessionService.DEFAULT_SEEKER_ID;
        readingSessionService.getOrCreateEffectiveUser(effectiveId);
        Page<CrystalTransaction> ledger = walletService.getLedger(effectiveId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }
}
