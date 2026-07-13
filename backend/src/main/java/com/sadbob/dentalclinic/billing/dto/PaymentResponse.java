package com.sadbob.dentalclinic.billing.dto;

import com.sadbob.dentalclinic.billing.enums.PaymentMethod;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PaymentResponse(
        Long id,
        Long invoiceId,
        BigDecimal amountPaid,
        PaymentMethod paymentMethod,
        LocalDateTime paidAt,
        String referenceNumber,
        String notes
) {}