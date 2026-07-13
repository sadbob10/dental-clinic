package com.sadbob.dentalclinic.billing.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceRequest(

        @NotNull(message = "Patient ID is required")
        Long patientId,

        Long appointmentId,

        @NotEmpty(message = "At least one invoice item is required")
        @Valid
        List<InvoiceItemRequest> items,

        @DecimalMin(value = "0.00", message = "Discount cannot be negative")
        BigDecimal discount,

        String notes,

        LocalDateTime dueDate
) {}