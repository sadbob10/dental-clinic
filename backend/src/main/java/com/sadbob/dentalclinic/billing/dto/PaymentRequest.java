package com.sadbob.dentalclinic.billing.dto;

import com.sadbob.dentalclinic.billing.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record PaymentRequest(

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        BigDecimal amountPaid,

        @NotNull(message = "Payment method is required")
        PaymentMethod paymentMethod,

        String referenceNumber,

        String notes
) {}