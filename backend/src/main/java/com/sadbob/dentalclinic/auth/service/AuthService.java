package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.dto.AuthResponse;
import com.sadbob.dentalclinic.auth.dto.LoginRequest;
import com.sadbob.dentalclinic.auth.dto.RefreshTokenRequest;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse refresh(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);
}