package com.sadbob.dentalclinic.treatment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TreatmentRecordRequest(

        @NotNull(message = "Patient ID is required")
        Long patientId,

        // Optional — treatment can exist without a linked appointment
        Long appointmentId,

        @NotNull(message = "Dentist ID is required")
        Long dentistId,

        String diagnosis,

        @NotBlank(message = "Treatment done description is required")
        String treatmentDone,

        String prescription,

        String nextVisitNotes
) {}