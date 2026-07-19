package com.sadbob.dentalclinic.auth.dto;

public record AuthResponse(
        String accessToken,
        String refreshToken,
        String tokenType,
        long expiresIn,
        String email,
        String fullName,
        String role
) {
    // Convenience constructor with default tokenType
    public AuthResponse(String accessToken, String refreshToken,
                        long expiresIn, String email,
                        String fullName, String role) {
        this(accessToken, refreshToken, "Bearer",
                expiresIn, email, fullName, role);
    }
}