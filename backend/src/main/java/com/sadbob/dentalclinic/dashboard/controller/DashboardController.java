package com.sadbob.dentalclinic.dashboard.controller;

import com.sadbob.dentalclinic.dashboard.dto.DentistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.dto.ReceptionistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Role-based dashboard data")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/receptionist")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Get receptionist dashboard — today's overview or specific date")
    public ResponseEntity<ReceptionistDashboardResponse> getReceptionistDashboard(
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(dashboardService.getReceptionistDashboard(date));
    }

    @GetMapping("/dentist")
    @PreAuthorize("hasAnyRole('ADMIN', 'DENTIST')")
    @Operation(summary = "Get dentist dashboard — personal schedule and stats")
    public ResponseEntity<DentistDashboardResponse> getDentistDashboard(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity.ok(
                dashboardService.getDentistDashboard(userDetails.getUsername())
        );
    }
}