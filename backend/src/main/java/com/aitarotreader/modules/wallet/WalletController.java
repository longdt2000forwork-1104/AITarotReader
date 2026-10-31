package com.aitarotreader.modules.wallet;

import com.aitarotreader.common.ApiResponse;
import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@Tag(name = "Wallet & Crystals", description = "Crystal balance and immutable credit ledger transactions")
@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @Operation(summary = "Get current seeker's Crystal balance")
    @GetMapping("/balance")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getBalance(@AuthenticationPrincipal UUID userId) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        Integer balance = walletService.getBalance(userId);
        return ResponseEntity.ok(ApiResponse.ok(Map.of("userId", userId, "crystalBalance", balance)));
    }

    @Operation(summary = "Get immutable Crystal ledger history")
    @GetMapping("/ledger")
    public ResponseEntity<ApiResponse<Page<CrystalTransaction>>> getLedger(
            @AuthenticationPrincipal UUID userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        if (userId == null) {
            throw new CustomException(ErrorCode.UNAUTHORIZED);
        }
        Page<CrystalTransaction> ledger = walletService.getLedger(userId, PageRequest.of(page, size));
        return ResponseEntity.ok(ApiResponse.ok(ledger));
    }
}
