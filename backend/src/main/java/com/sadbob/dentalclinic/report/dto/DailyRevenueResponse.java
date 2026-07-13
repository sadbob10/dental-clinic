package com.sadbob.dentalclinic.report.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueResponse(
        LocalDate date,
        BigDecimal collected
) {}