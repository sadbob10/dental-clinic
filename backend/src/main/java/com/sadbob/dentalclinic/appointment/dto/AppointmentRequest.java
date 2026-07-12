package com.sadbob.dentalclinic.appointment.dto;

import com.sadbob.dentalclinic.appointment.enums.AppointmentType;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;

public record AppointmentRequest(

        @NotNull(message = "Patient ID is required")
        Long patientId,

        @NotNull(message = "Dentist ID is required")
        Long dentistId,

        @NotNull(message = "Scheduled time is required")
        @Future(message = "Appointment must be scheduled in the future")
        LocalDateTime scheduledAt,

        @Min(value = 15, message = "Duration must be at least 15 minutes")
        int durationMinutes,

        @NotNull(message = "Appointment type is required")
        AppointmentType type,

        String notes
) {}