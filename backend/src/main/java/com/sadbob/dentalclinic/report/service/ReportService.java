package com.sadbob.dentalclinic.report.service;

import com.sadbob.dentalclinic.report.dto.AppointmentReportResponse;
import com.sadbob.dentalclinic.report.dto.DailyRevenueResponse;
import com.sadbob.dentalclinic.report.dto.PatientReportResponse;
import com.sadbob.dentalclinic.report.dto.RevenueReportResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {

    RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to);

    List<DailyRevenueResponse> getDailyRevenue(LocalDate from, LocalDate to);

    AppointmentReportResponse getAppointmentReport(LocalDate from, LocalDate to);

    PatientReportResponse getPatientReport(LocalDate from, LocalDate to);
}