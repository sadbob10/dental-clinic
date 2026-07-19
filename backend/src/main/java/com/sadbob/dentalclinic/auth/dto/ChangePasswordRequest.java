package com.sadbob.dentalclinic.auth.dto;

import com.sadbob.dentalclinic.common.validation.ValidPassword;
import jakarta.validation.constraints.NotBlank;

public record ChangePasswordRequest(

        @NotBlank(message = "Current password is required")
        String currentPassword,

        @NotBlank(message = "New password is required")
        @ValidPassword
        String newPassword,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {}