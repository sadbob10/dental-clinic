package com.sadbob.dentalclinic.dashboard.service;

import com.sadbob.dentalclinic.appointment.dto.AppointmentSummary;
import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import com.sadbob.dentalclinic.appointment.mapper.AppointmentMapper;
import com.sadbob.dentalclinic.appointment.repository.AppointmentRepository;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.repository.UserRepository;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import com.sadbob.dentalclinic.billing.repository.InvoiceRepository;
import com.sadbob.dentalclinic.dashboard.dto.DentistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.dto.PendingInvoiceStats;
import com.sadbob.dentalclinic.dashboard.dto.ReceptionistDashboardResponse;
import com.sadbob.dentalclinic.dashboard.dto.TodayAppointmentStats;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AppointmentRepository appointmentRepository;
    private final InvoiceRepository     invoiceRepository;
    private final PatientRepository     patientRepository;
    private final UserRepository        userRepository;
    private final AppointmentMapper     appointmentMapper;

    @Override
    @Transactional(readOnly = true)
    public ReceptionistDashboardResponse getReceptionistDashboard(LocalDate date) {
        LocalDate targetDate     = date != null ? date : LocalDate.now();
        LocalDateTime startOfDay = targetDate.atStartOfDay();
        LocalDateTime endOfDay   = targetDate.atTime(LocalTime.MAX);

        // Today's appointment stats
        List<AppointmentSummary> todayList = appointmentRepository
                .findTodayAppointments(startOfDay, endOfDay)
                .stream()
                .map(appointmentMapper::toSummary)
                .toList();

        long scheduled = todayList.stream()
                .filter(a -> a.status() == AppointmentStatus.SCHEDULED).count();
        long confirmed = todayList.stream()
                .filter(a -> a.status() == AppointmentStatus.CONFIRMED).count();
        long completed = todayList.stream()
                .filter(a -> a.status() == AppointmentStatus.COMPLETED).count();
        long cancelled = todayList.stream()
                .filter(a -> a.status() == AppointmentStatus.CANCELLED).count();

        TodayAppointmentStats todayStats = new TodayAppointmentStats(
                todayList.size(), scheduled, confirmed, completed, cancelled
        );

        LocalDateTime now         = LocalDateTime.now();
        LocalDateTime endOfDayNow = targetDate.atTime(LocalTime.MAX);

        List<AppointmentSummary> upcoming = appointmentRepository
                .findTodayAppointments(now, endOfDayNow)
                .stream()
                .map(appointmentMapper::toSummary)
                .filter(a -> a.status() == AppointmentStatus.SCHEDULED
                        || a.status() == AppointmentStatus.CONFIRMED)
                .limit(5)
                .toList();

        // Pending invoice stats
        List<InvoiceStatus> pendingStatuses = List.of(
                InvoiceStatus.ISSUED,
                InvoiceStatus.PARTIALLY_PAID
        );
        long pendingCount           = invoiceRepository.countByStatusIn(pendingStatuses);
        BigDecimal totalOutstanding = invoiceRepository
                .sumNetAmountByStatusIn(pendingStatuses);

        PendingInvoiceStats pendingInvoices = new PendingInvoiceStats(
                pendingCount, totalOutstanding
        );

        // Patient stats
        long newPatientsToday    = patientRepository
                .countNewPatientsToday(startOfDay, endOfDay);
        long totalActivePatients = patientRepository.countByDeletedFalse();

        return new ReceptionistDashboardResponse(
                todayStats,
                upcoming,
                pendingInvoices,
                newPatientsToday,
                totalActivePatients
        );
    }

    @Override
    @Transactional(readOnly = true)
    public DentistDashboardResponse getDentistDashboard(String email) {
        User dentist = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found: " + email));

        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay   = LocalDate.now().atTime(LocalTime.MAX);

        // Today's appointments for this dentist
        List<AppointmentSummary> todayAppointments = appointmentRepository
                .findTodayAppointmentsByDentist(
                        dentist.getId(), startOfDay, endOfDay)
                .stream()
                .map(appointmentMapper::toSummary)
                .toList();

        // Next upcoming appointment
        AppointmentSummary nextAppointment = appointmentRepository
                .findNextAppointmentByDentist(
                        dentist.getId(),
                        LocalDateTime.now(),
                        PageRequest.of(0, 1))
                .stream()
                .map(appointmentMapper::toSummary)
                .findFirst()
                .orElse(null);

        // Completed today
        long completedToday = appointmentRepository
                .countCompletedTodayByDentist(
                        dentist.getId(), startOfDay, endOfDay);

        // This month's total
        LocalDateTime startOfMonth = LocalDate.now()
                .withDayOfMonth(1).atStartOfDay();
        LocalDateTime endOfMonth   = LocalDate.now()
                .withDayOfMonth(LocalDate.now().lengthOfMonth())
                .atTime(LocalTime.MAX);

        long totalThisMonth = appointmentRepository
                .countByDentistAndDateRange(
                        dentist.getId(), startOfMonth, endOfMonth);

        return new DentistDashboardResponse(
                todayAppointments,
                nextAppointment,
                completedToday,
                totalThisMonth
        );
    }
}