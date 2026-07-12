package com.sadbob.dentalclinic.appointment.dto;

import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import jakarta.validation.constraints.NotNull;

public record AppointmentStatusRequest(

        @NotNull(message = "Status is required")
        AppointmentStatus status
) {}