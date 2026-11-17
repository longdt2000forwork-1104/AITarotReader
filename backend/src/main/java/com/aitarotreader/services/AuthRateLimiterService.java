package com.aitarotreader.services;

import com.aitarotreader.exceptions.CustomException;
import com.aitarotreader.exceptions.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthRateLimiterService {

    private static final long WINDOW_SECONDS = 300; // 5 minutes

    @Value("${app.auth.rate-limit.enabled:true}")
    private boolean enabled;

    private final ConcurrentHashMap<String, Deque<Instant>> buckets = new ConcurrentHashMap<>();

    public void checkLoginLimit(String ip, String email) {
        if (!enabled) return;
        String normIp = normalize(ip);
        String normEmail = normalize(email);
        enforce("login:ip:" + normIp, 30);
        if (!normEmail.isEmpty()) {
            enforce("login:ip_email:" + normIp + ":" + normEmail, 10);
        }
    }

    public void checkForgotPasswordLimit(String ip, String email) {
        if (!enabled) return;
        String normIp = normalize(ip);
        String normEmail = normalize(email);
        enforce("forgot:ip:" + normIp, 15);
        if (!normEmail.isEmpty()) {
            enforce("forgot:email:" + normEmail, 5);
        }
    }

    public void checkResendVerificationLimit(String ip, String email) {
        if (!enabled) return;
        String normIp = normalize(ip);
        String normEmail = normalize(email);
        enforce("resend:ip:" + normIp, 15);
        if (!normEmail.isEmpty()) {
            enforce("resend:email:" + normEmail, 5);
        }
    }

    public void clearAll() {
        buckets.clear();
    }

    private void enforce(String key, int maxRequests) {
        Instant now = Instant.now();
        Instant cutoff = now.minusSeconds(WINDOW_SECONDS);

        Deque<Instant> queue = buckets.computeIfAbsent(key, k -> new ArrayDeque<>());
        synchronized (queue) {
            while (!queue.isEmpty() && queue.peekFirst().isBefore(cutoff)) {
                queue.pollFirst();
            }
            if (queue.size() >= maxRequests) {
                throw new CustomException(ErrorCode.TOO_MANY_REQUESTS,
                        "Too many attempts. Please wait a few minutes before trying again.");
            }
            queue.addLast(now);
        }
    }

    private String normalize(String value) {
        return value == null ? "unknown" : value.trim().toLowerCase();
    }
}
