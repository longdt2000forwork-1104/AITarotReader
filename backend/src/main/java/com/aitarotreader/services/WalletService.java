package com.aitarotreader.services;

import com.aitarotreader.entities.*;
import com.aitarotreader.dtos.*;
import com.aitarotreader.repositories.*;
import com.aitarotreader.utils.*;
import com.aitarotreader.exceptions.*;

import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;


import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private static final String DAILY_REWARD_REASON = "DAILY_REWARD";
    private static final int DAILY_REWARD_AMOUNT = 10;
    private static final ZoneId DAILY_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final UserRepository userRepository;
    private final CrystalTransactionRepository transactionRepository;

    private String todayDailyReferenceId() {
        return "daily-" + LocalDate.now(DAILY_ZONE);
    }

    @Transactional(readOnly = true)
    public boolean hasClaimedDailyRewardToday(UUID userId) {
        return transactionRepository.existsByUserIdAndReasonCodeAndReferenceId(
                userId, DAILY_REWARD_REASON, todayDailyReferenceId());
    }

    @Transactional
    public boolean claimDailyReward(UUID userId) {
        String refId = todayDailyReferenceId();
        if (transactionRepository.existsByUserIdAndReasonCodeAndReferenceId(userId, DAILY_REWARD_REASON, refId)) {
            log.info("User {} already claimed daily reward for {}", userId, refId);
            return false;
        }
        creditCrystals(userId, DAILY_REWARD_AMOUNT, DAILY_REWARD_REASON, refId, "Daily Dawn Login Blessing");
        return true;
    }

    @Transactional(readOnly = true)
    public Integer getBalance(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getCrystalBalance)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));
    }

    @Transactional
    public void deductCrystals(UUID userId, int amount, String reasonCode, String referenceId, String description) {
        if (amount <= 0) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));

        if (user.getCrystalBalance() < amount) {
            throw new CustomException(ErrorCode.INSUFFICIENT_CRYSTALS,
                    String.format("Requires %d crystals, but balance is only %d", amount, user.getCrystalBalance()));
        }

        user.setCrystalBalance(user.getCrystalBalance() - amount);
        userRepository.save(user);

        CrystalTransaction transaction = CrystalTransaction.builder()
                .user(user)
                .amount(-amount)
                .reasonCode(reasonCode)
                .referenceId(referenceId)
                .description(description)
                .build();
        transactionRepository.save(transaction);
        log.info("Deducted {} crystals from user {} for {}", amount, userId, reasonCode);
    }

    @Transactional
    public void creditCrystals(UUID userId, int amount, String reasonCode, String referenceId, String description) {
        if (amount <= 0) return;

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_FOUND, "User not found"));

        user.setCrystalBalance(user.getCrystalBalance() + amount);
        userRepository.save(user);

        CrystalTransaction transaction = CrystalTransaction.builder()
                .user(user)
                .amount(amount)
                .reasonCode(reasonCode)
                .referenceId(referenceId)
                .description(description)
                .build();
        transactionRepository.save(transaction);
        log.info("Credited {} crystals to user {} for {}", amount, userId, reasonCode);
    }

    @Transactional(readOnly = true)
    public Page<CrystalTransaction> getLedger(UUID userId, Pageable pageable) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }
}
