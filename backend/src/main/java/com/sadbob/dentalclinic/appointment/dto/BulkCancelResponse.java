package com.sadbob.dentalclinic.appointment.dto;

import java.time.LocalDate;

public record BulkCancelResponse(
        int cancelledCount,
        LocalDate date,
        Long dentistId,
        String reason
) {}