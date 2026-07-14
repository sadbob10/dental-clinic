package com.sadbob.dentalclinic.dashboard.dto;

import com.sadbob.dentalclinic.appointment.dto.AppointmentSummary;

import java.util.List;

public record DentistDashboardResponse(
        List<AppointmentSummary> todayAppointments,
        AppointmentSummary nextAppointment,
        long completedToday,
        long totalAppointmentsThisMonth
) {}