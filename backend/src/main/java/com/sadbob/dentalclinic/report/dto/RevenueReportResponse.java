package com.sadbob.dentalclinic.report.dto;

import java.math.BigDecimal;

public record RevenueReportResponse(
        BigDecimal totalInvoiced,
        BigDecimal totalCollected,
        BigDecimal totalOutstanding,
        BigDecimal totalDiscount,
        long invoiceCount,
        long paidInvoiceCount,
        long partiallyPaidCount,
        long cancelledCount
) {}