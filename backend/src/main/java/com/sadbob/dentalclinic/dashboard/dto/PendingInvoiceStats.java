package com.sadbob.dentalclinic.dashboard.dto;

import java.math.BigDecimal;

public record PendingInvoiceStats(
        long count,
        BigDecimal totalOutstanding
) {}