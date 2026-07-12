package com.sadbob.dentalclinic.patient.dto;

import java.time.LocalDate;

public record PatientSummary(
        Long id,
        String fullName,
        LocalDate dateOfBirth,
        String gender,
        String phone,
        String email
) {}