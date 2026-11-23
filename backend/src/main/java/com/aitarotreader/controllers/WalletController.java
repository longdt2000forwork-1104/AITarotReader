package com.aitarotreader.controllers;

import com.aitarotreader.entities.CrystalTransaction;
import com.aitarotreader.entities.User;
import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import com.aitarotreader.repositories.UserRepository;
import com.aitarotreader.services.WalletService;
import com.aitarotreader.utils.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Wallet & Crystals", description = "Crystal balance and immutable credit ledger transactions")
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final UserRepository userRepository;

    @Operation(summary = "Get current seeker's Crystal balance")
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance(@AuthenticationPrincipal UUID userId) {
        User user = requireAuthenticatedUser(userId);
        Integer balance = walletService.getBalance(user.getId());
        boolean dailyFreeAvailable = !walletService.hasClaimedDailyRewardToday(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(Map.of(
                "userId", user.getId(),
                "balance", balance,
                "crystalBalance", balance,
                "tier", user.getTier().name(),
                "dailyFreeAvailable", dailyFreeAvailable
        )));
    }

    @Operation(summary = "Claim daily login crystal reward (+10 Crystals)")
    @PostMapping("/daily-reward")
    public ResponseEntity<ApiResponse<Map<String, Object>>> claimDailyReward(@AuthenticationPrincipal UUID userId) {
        User user = requireAuthenticatedUser(userId);
        boolean claimedNow = walletService.claimDailyReward(user.getId());
        Integer balance = walletService.getBalance(user.getId());
        String msg = claimedNow
                ? "Daily reward claimed (+10 Crystals)"
                : "Daily reward already claimed today";
        return ResponseEntity.ok(ApiResponse.ok(msg, Map.of(
                "userId", user.getId(),
                "balance", balance,
                "crystalBalance", balance,
                "tier", user.getTier().name(),
                "dailyFreeAvailable", false,
                "alreadyClaimed", !claimedNow
        )));
    }

    @Operation(summary = "Get immutable Crystal ledger history")
    @GetMapping("/ledger")
    public ResponseEntity<ApiResponse<Page<CrystalTransaction>>> getLedger(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User user = requireAuthenticatedUser(userId);
        Page<CrystalTransaction> ledger = walletService.getLedger(user.getId(), PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }

    private User requireAuthenticatedUser(UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.UNAUTHORIZED, "User not found"));
    }
}
