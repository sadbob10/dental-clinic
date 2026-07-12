package com.sadbob.dentalclinic.appointment.dto;

import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import com.sadbob.dentalclinic.appointment.enums.AppointmentType;

import java.time.LocalDateTime;

public record AppointmentResponse(
        Long id,
        Long patientId,
        String patientName,
        Long dentistId,
        String dentistName,
        LocalDateTime scheduledAt,
        int durationMinutes,
        AppointmentStatus status,
        AppointmentType type,
        String notes,
        LocalDateTime createdAt,
        String createdBy
) {}