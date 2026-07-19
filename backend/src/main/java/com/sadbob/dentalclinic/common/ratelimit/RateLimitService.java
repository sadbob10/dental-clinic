package com.sadbob.dentalclinic.common.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class RateLimitService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    private static final int    MAX_ATTEMPTS    = 5;
    private static final int    REFILL_MINUTES  = 1;

    private Bucket createBucket() {
        Bandwidth limit = Bandwidth.builder()
                .capacity(MAX_ATTEMPTS)
                .refillGreedy(MAX_ATTEMPTS, Duration.ofMinutes(REFILL_MINUTES))
                .build();
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    public boolean tryConsume(String ipAddress) {
        Bucket bucket = buckets.computeIfAbsent(ipAddress, k -> createBucket());
        boolean allowed = bucket.tryConsume(1);
        if (!allowed) {
            log.warn("Rate limit exceeded for IP: {}", ipAddress);
        }
        return allowed;
    }

    public long getRemainingAttempts(String ipAddress) {
        Bucket bucket = buckets.get(ipAddress);
        if (bucket == null) return MAX_ATTEMPTS;
        return bucket.getAvailableTokens();
    }
}