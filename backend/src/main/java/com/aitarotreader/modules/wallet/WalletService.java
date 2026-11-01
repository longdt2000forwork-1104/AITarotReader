package com.aitarotreader.modules.wallet;

import com.aitarotreader.common.CustomException;
import com.aitarotreader.common.ErrorCode;
import com.aitarotreader.modules.user.User;
import com.aitarotreader.modules.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final CrystalTransactionRepository transactionRepository;

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
