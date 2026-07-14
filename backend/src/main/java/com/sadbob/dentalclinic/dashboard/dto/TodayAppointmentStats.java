package com.sadbob.dentalclinic.dashboard.dto;

public record TodayAppointmentStats(
        long total,
        long scheduled,
        long confirmed,
        long completed,
        long cancelled
) {}