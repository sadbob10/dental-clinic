package com.sadbob.dentalclinic.appointment.service;

import com.sadbob.dentalclinic.appointment.dto.*;
import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import com.sadbob.dentalclinic.appointment.mapper.AppointmentMapper;
import com.sadbob.dentalclinic.appointment.repository.AppointmentRepository;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.repository.UserRepository;
import com.sadbob.dentalclinic.notification.service.EmailService;
import com.sadbob.dentalclinic.patient.entity.Patient;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;
    private final UserRepository        userRepository;
    private final AppointmentMapper     appointmentMapper;
    private final EmailService emailService;

    @Override
    @Transactional
    public AppointmentResponse create(AppointmentRequest request, String createdBy) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + request.patientId()));

        User dentist = userRepository.findById(request.dentistId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Dentist not found with id: " + request.dentistId()));

        checkConflict(request.dentistId(), request.scheduledAt(),
                request.durationMinutes(), 0L);

        Appointment appointment = appointmentMapper.toEntity(request);
        appointment.setPatient(patient);
        appointment.setDentist(dentist);
        appointment.setCreatedBy(createdBy);

        Appointment saved = appointmentRepository.save(appointment);

        log.info("Appointment created: id={}, patient={}, dentist={}, at={}",
                saved.getId(), patient.getFullName(),
                dentist.getFullName(), saved.getScheduledAt());

        emailService.sendAppointmentConfirmation(saved);

        return appointmentMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponse getById(Long id) {
        return appointmentMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AppointmentSummary> getAll(
            Long dentistId,
            Long patientId,
            AppointmentStatus status,
            LocalDate date,
            Pageable pageable
    ) {
        Page<Appointment> result;

        if (date != null) {
            LocalDateTime from = date.atStartOfDay();
            LocalDateTime to   = date.atTime(LocalTime.MAX);
            result = appointmentRepository
                    .findByDeletedFalseAndScheduledAtBetween(from, to, pageable);
        } else if (dentistId != null) {
            result = appointmentRepository
                    .findByDeletedFalseAndDentist_Id(dentistId, pageable);
        } else if (patientId != null) {
            result = appointmentRepository
                    .findByDeletedFalseAndPatient_Id(patientId, pageable);
        } else if (status != null) {
            result = appointmentRepository
                    .findByDeletedFalseAndStatus(status, pageable);
        } else {
            result = appointmentRepository.findAllByDeletedFalse(pageable);
        }

        return result.map(appointmentMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentSummary> getToday() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = LocalDate.now().atTime(LocalTime.MAX);

        return appointmentRepository
                .findTodayAppointments(startOfDay, endOfDay)
                .stream()
                .map(appointmentMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public AppointmentResponse update(Long id, AppointmentRequest request) {
        Appointment appointment = findOrThrow(id);

        if (appointment.getStatus().isTerminal()) {
            throw new IllegalStateException(
                    "Cannot update a " + appointment.getStatus() + " appointment");
        }

        Patient patient = patientRepository.findByIdAndDeletedFalse(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + request.patientId()));

        User dentist = userRepository.findById(request.dentistId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Dentist not found with id: " + request.dentistId()));

        checkConflict(request.dentistId(), request.scheduledAt(),
                request.durationMinutes(), id);

        appointmentMapper.updateEntity(request, appointment);
        appointment.setPatient(patient);
        appointment.setDentist(dentist);

        Appointment updated = appointmentRepository.save(appointment);

        log.info("Appointment updated: id={}", updated.getId());

        return appointmentMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public AppointmentResponse updateStatus(Long id, AppointmentStatusRequest request) {
        Appointment appointment = findOrThrow(id);
        AppointmentStatus current = appointment.getStatus();
        AppointmentStatus next    = request.status();

        if (!current.canTransitionTo(next)) {
            throw new IllegalStateException(
                    "Cannot transition from " + current + " to " + next);
        }

        appointment.setStatus(next);
        Appointment updated = appointmentRepository.save(appointment);

        log.info("Appointment {} status changed: {} → {}",
                id, current, next);

        emailService.sendAppointmentStatusUpdate(updated);

        return appointmentMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Appointment appointment = findOrThrow(id);
        appointment.setDeleted(true);
        appointmentRepository.save(appointment);
        log.info("Appointment soft-deleted: id={}", id);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Appointment findOrThrow(Long id) {
        return appointmentRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Appointment not found with id: " + id));
    }

    private void checkConflict(Long dentistId, LocalDateTime scheduledAt,
                               int durationMinutes, Long excludeId) {
        LocalDateTime endTime   = scheduledAt.plusMinutes(durationMinutes);
        LocalDateTime startTime = scheduledAt.minusMinutes(120); // 2hr lookback

        boolean conflict = appointmentRepository
                .hasConflict(dentistId, startTime, endTime, excludeId);

        if (conflict) {
            throw new IllegalArgumentException(
                    "Dentist already has an appointment at this time");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public CalendarResponse getCalendar(int year, int month, Long dentistId) {
        LocalDateTime from = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime to   = LocalDate.of(year, month, 1)
                .withDayOfMonth(LocalDate.of(year, month, 1).lengthOfMonth())
                .atTime(LocalTime.MAX);

        List<AppointmentStatus> excluded = List.of(
                AppointmentStatus.CANCELLED,
                AppointmentStatus.NO_SHOW
        );

        List<Appointment> appointments;

        if (dentistId != null) {
            appointments = appointmentRepository
                    .findByDeletedFalseAndDentist_IdAndScheduledAtBetweenAndStatusNotInOrderByScheduledAtAsc(
                            dentistId, from, to, excluded);
        } else {
            appointments = appointmentRepository
                    .findByDeletedFalseAndScheduledAtBetweenAndStatusNotInOrderByScheduledAtAsc(
                            from, to, excluded);
        }

        // Group by date
        Map<LocalDate, List<AppointmentSummary>> days = appointments.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        a -> a.getScheduledAt().toLocalDate(),
                        java.util.TreeMap::new,
                        java.util.stream.Collectors.mapping(
                                appointmentMapper::toSummary,
                                java.util.stream.Collectors.toList()
                        )
                ));

        return new CalendarResponse(year, month, days);
    }
}