package com.sadbob.dentalclinic.appointment.dto;

import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import com.sadbob.dentalclinic.appointment.enums.AppointmentType;

import java.time.LocalDateTime;

public record AppointmentSummary(
        Long id,
        String patientName,
        String dentistName,
        LocalDateTime scheduledAt,
        int durationMinutes,
        AppointmentStatus status,
        AppointmentType type
) {}