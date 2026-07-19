package com.sadbob.dentalclinic.auth.dto;

import com.sadbob.dentalclinic.auth.enums.Role;
import com.sadbob.dentalclinic.common.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Password is required")
        @ValidPassword
        String password,

        @NotNull(message = "Role is required")
        Role role
) {}