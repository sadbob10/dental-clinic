package com.sadbob.dentalclinic.appointment.service;

import com.sadbob.dentalclinic.appointment.dto.*;
import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentService {

    AppointmentResponse create(AppointmentRequest request, String createdBy);

    AppointmentResponse getById(Long id);

    Page<AppointmentSummary> getAll(
            Long dentistId,
            Long patientId,
            AppointmentStatus status,
            LocalDate date,
            Pageable pageable
    );

    List<AppointmentSummary> getToday();

    AppointmentResponse update(Long id, AppointmentRequest request);

    AppointmentResponse updateStatus(Long id, AppointmentStatusRequest request);

    void delete(Long id);

    CalendarResponse getCalendar(int year, int month, Long dentistId);

    BulkCancelResponse bulkCancel(Long dentistId, LocalDate date, String reason);
}