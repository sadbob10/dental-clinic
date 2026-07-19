package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.entity.RefreshToken;
import com.sadbob.dentalclinic.auth.entity.User;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

    RefreshToken validateRefreshToken(String token);

    void revokeRefreshToken(String token);

    void revokeAllUserTokens(Long userId);
}