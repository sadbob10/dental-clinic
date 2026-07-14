package com.sadbob.dentalclinic.dashboard.dto;

import com.sadbob.dentalclinic.appointment.dto.AppointmentSummary;

import java.util.List;

public record ReceptionistDashboardResponse(
        TodayAppointmentStats todayAppointments,
        List<AppointmentSummary> upcomingAppointments,
        PendingInvoiceStats pendingInvoices,
        long newPatientsToday,
        long totalActivePatients
) {}