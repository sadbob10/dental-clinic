package com.sadbob.dentalclinic.report.dto;

import java.util.Map;

public record AppointmentReportResponse(
        long total,
        long scheduled,
        long confirmed,
        long completed,
        long cancelled,
        long noShow,
        Map<String, Long> byType
) {}