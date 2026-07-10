package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.dto.LoginRequest;
import com.sadbob.dentalclinic.auth.dto.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}