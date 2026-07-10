package com.sadbob.dentalclinic.auth.dto;

public record LoginResponse(
        String token,
        String email,
        String fullName,
        String role
) {}