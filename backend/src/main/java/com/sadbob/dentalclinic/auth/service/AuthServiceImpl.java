package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.dto.AuthResponse;
import com.sadbob.dentalclinic.auth.dto.LoginRequest;
import com.sadbob.dentalclinic.auth.dto.RefreshTokenRequest;
import com.sadbob.dentalclinic.auth.entity.RefreshToken;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.jwt.JwtUtil;
import com.sadbob.dentalclinic.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager  authenticationManager;
    private final UserRepository         userRepository;
    private final JwtUtil                jwtUtil;
    private final RefreshTokenService    refreshTokenService;

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(), request.password())
        );

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        log.info("User logged in: {}", user.getEmail());

        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                jwtUtil.getExpirationMs(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

    @Override
    @Transactional
    public AuthResponse refresh(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenService
                .validateRefreshToken(request.refreshToken());

        User user = refreshToken.getUser();

        // Rotate — revoke old, issue new
        refreshTokenService.revokeRefreshToken(request.refreshToken());
        RefreshToken newRefreshToken = refreshTokenService.createRefreshToken(user);

        String accessToken = jwtUtil.generateToken(
                user.getEmail(), user.getRole().name());

        log.info("Token refreshed for user: {}", user.getEmail());

        return new AuthResponse(
                accessToken,
                newRefreshToken.getToken(),
                jwtUtil.getExpirationMs(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().name()
        );
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        refreshTokenService.revokeRefreshToken(request.refreshToken());
        log.info("User logged out via refresh token revocation");
    }
}