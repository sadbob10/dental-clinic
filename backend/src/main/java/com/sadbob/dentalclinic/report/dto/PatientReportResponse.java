package com.sadbob.dentalclinic.report.dto;

public record PatientReportResponse(
        long totalPatients,
        long newPatients
) {}