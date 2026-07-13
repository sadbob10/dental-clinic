package com.sadbob.dentalclinic.billing.dto;

import java.math.BigDecimal;

public record InvoiceItemResponse(
        Long id,
        String description,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal
) {}