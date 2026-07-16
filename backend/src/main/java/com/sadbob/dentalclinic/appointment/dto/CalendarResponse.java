package com.sadbob.dentalclinic.appointment.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record CalendarResponse(
        int year,
        int month,
        Map<LocalDate, List<AppointmentSummary>> days
) {}