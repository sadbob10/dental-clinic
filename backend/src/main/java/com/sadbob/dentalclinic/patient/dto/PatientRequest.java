package com.sadbob.dentalclinic.patient.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public record PatientRequest(

        @NotBlank(message = "Full name is required")
        @Size(max = 255, message = "Full name must not exceed 255 characters")
        String fullName,

        LocalDate dateOfBirth,

        @Pattern(regexp = "^(MALE|FEMALE|OTHER)$",
                message = "Gender must be MALE, FEMALE, or OTHER")
        String gender,

        @NotBlank(message = "Phone number is required")
        @Size(max = 20, message = "Phone must not exceed 20 characters")
        String phone,

        @Email(message = "Invalid email format")
        String email,

        String address,

        String emergencyContact,

        String medicalNotes
) {}