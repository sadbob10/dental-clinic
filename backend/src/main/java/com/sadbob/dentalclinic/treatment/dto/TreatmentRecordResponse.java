package com.sadbob.dentalclinic.treatment.dto;

import java.time.LocalDateTime;

public record TreatmentRecordResponse(
        Long id,
        Long patientId,
        String patientName,
        Long appointmentId,
        Long dentistId,
        String dentistName,
        String diagnosis,
        String treatmentDone,
        String prescription,
        String nextVisitNotes,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}