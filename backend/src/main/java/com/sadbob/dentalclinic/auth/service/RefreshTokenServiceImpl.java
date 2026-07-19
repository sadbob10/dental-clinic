package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.entity.RefreshToken;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.repository.RefreshTokenRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${application.jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    @Override
    @Transactional
    public RefreshToken createRefreshToken(User user) {
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(UUID.randomUUID().toString())
                .expiresAt(LocalDateTime.now()
                        .plusSeconds(refreshExpirationMs / 1000))
                .build();

        RefreshToken saved = refreshTokenRepository.save(refreshToken);
        log.debug("Refresh token created for user: {}", user.getEmail());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public RefreshToken validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Refresh token not found"));

        if (!refreshToken.isValid()) {
            throw new IllegalArgumentException(
                    refreshToken.isRevoked()
                            ? "Refresh token has been revoked"
                            : "Refresh token has expired");
        }

        return refreshToken;
    }

    @Override
    @Transactional
    public void revokeRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Refresh token not found"));

        refreshToken.setRevoked(true);
        refreshTokenRepository.save(refreshToken);
        log.info("Refresh token revoked for user: {}",
                refreshToken.getUser().getEmail());
    }

    @Override
    @Transactional
    public void revokeAllUserTokens(Long userId) {
        refreshTokenRepository.revokeAllByUserId(userId);
        log.info("All refresh tokens revoked for user id: {}", userId);
    }
}