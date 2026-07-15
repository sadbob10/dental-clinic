package com.sadbob.dentalclinic.auth.dto;

import com.sadbob.dentalclinic.auth.enums.Role;

import java.time.LocalDateTime;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean isActive,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}