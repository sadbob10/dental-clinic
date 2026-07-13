package com.sadbob.dentalclinic.report.controller;

import com.sadbob.dentalclinic.report.dto.AppointmentReportResponse;
import com.sadbob.dentalclinic.report.dto.DailyRevenueResponse;
import com.sadbob.dentalclinic.report.dto.PatientReportResponse;
import com.sadbob.dentalclinic.report.dto.RevenueReportResponse;
import com.sadbob.dentalclinic.report.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Tag(name = "Reports", description = "Revenue, appointment and patient statistics")
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get revenue summary for a date range")
    public ResponseEntity<RevenueReportResponse> getRevenueReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(reportService.getRevenueReport(from, to));
    }

    @GetMapping("/revenue/daily")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get daily revenue breakdown for a date range")
    public ResponseEntity<List<DailyRevenueResponse>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(reportService.getDailyRevenue(from, to));
    }

    @GetMapping("/appointments")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Get appointment statistics for a date range")
    public ResponseEntity<AppointmentReportResponse> getAppointmentReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(reportService.getAppointmentReport(from, to));
    }

    @GetMapping("/patients")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Get patient statistics for a date range")
    public ResponseEntity<PatientReportResponse> getPatientReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(reportService.getPatientReport(from, to));
    }
}