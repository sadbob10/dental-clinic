package com.sadbob.dentalclinic.billing.dto;

import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record InvoiceResponse(
        Long id,
        Long patientId,
        String patientName,
        Long appointmentId,
        InvoiceStatus status,
        BigDecimal totalAmount,
        BigDecimal discount,
        BigDecimal netAmount,
        String notes,
        LocalDateTime issuedAt,
        LocalDateTime dueDate,
        List<InvoiceItemResponse> items,
        LocalDateTime createdAt,
        String createdBy
) {}