package com.sadbob.dentalclinic.patient.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record PatientResponse(
        Long id,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String phone,
        String email,
        String address,
        String emergencyContact,
        String medicalNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String createdBy
) {}