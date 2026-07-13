package com.sadbob.dentalclinic.billing.dto;

import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record InvoiceSummary(
        Long id,
        String patientName,
        InvoiceStatus status,
        BigDecimal netAmount,
        LocalDateTime createdAt
) {}