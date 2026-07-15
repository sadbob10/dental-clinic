package com.sadbob.dentalclinic.auth.dto;

import com.sadbob.dentalclinic.auth.enums.Role;

public record UserSummary(
        Long id,
        String fullName,
        String email,
        Role role,
        boolean isActive
) {}