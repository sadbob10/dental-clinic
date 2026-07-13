package com.sadbob.dentalclinic.report.service;

import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import com.sadbob.dentalclinic.appointment.enums.AppointmentType;
import com.sadbob.dentalclinic.appointment.repository.AppointmentRepository;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import com.sadbob.dentalclinic.billing.repository.InvoiceRepository;
import com.sadbob.dentalclinic.billing.repository.PaymentRepository;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import com.sadbob.dentalclinic.report.dto.AppointmentReportResponse;
import com.sadbob.dentalclinic.report.dto.DailyRevenueResponse;
import com.sadbob.dentalclinic.report.dto.PatientReportResponse;
import com.sadbob.dentalclinic.report.dto.RevenueReportResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final InvoiceRepository     invoiceRepository;
    private final PaymentRepository     paymentRepository;
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository     patientRepository;

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.atTime(LocalTime.MAX);

        BigDecimal totalInvoiced  = invoiceRepository
                .sumNetAmountByDateRange(fromDt, toDt);
        BigDecimal totalCollected = paymentRepository
                .sumCollectedByDateRange(fromDt, toDt);
        BigDecimal totalDiscount  = invoiceRepository
                .sumDiscountByDateRange(fromDt, toDt);
        BigDecimal totalOutstanding = totalInvoiced
                .subtract(totalCollected)
                .max(BigDecimal.ZERO);

        long paidCount        = invoiceRepository
                .countByStatusAndDateRange(InvoiceStatus.PAID, fromDt, toDt);
        long partiallyPaid    = invoiceRepository
                .countByStatusAndDateRange(InvoiceStatus.PARTIALLY_PAID, fromDt, toDt);
        long cancelled        = invoiceRepository
                .countByStatusAndDateRange(InvoiceStatus.CANCELLED, fromDt, toDt);
        long draft            = invoiceRepository
                .countByStatusAndDateRange(InvoiceStatus.DRAFT, fromDt, toDt);
        long issued           = invoiceRepository
                .countByStatusAndDateRange(InvoiceStatus.ISSUED, fromDt, toDt);
        long invoiceCount     = paidCount + partiallyPaid + cancelled + draft + issued;

        log.info("Revenue report generated: from={}, to={}, invoiced={}, collected={}",
                from, to, totalInvoiced, totalCollected);

        return new RevenueReportResponse(
                totalInvoiced,
                totalCollected,
                totalOutstanding,
                totalDiscount,
                invoiceCount,
                paidCount,
                partiallyPaid,
                cancelled
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyRevenueResponse> getDailyRevenue(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.atTime(LocalTime.MAX);

        List<Object[]> rows = paymentRepository
                .dailyCollectedByDateRange(fromDt, toDt);

        return rows.stream()
                .map(row -> new DailyRevenueResponse(
                        ((java.sql.Date) row[0]).toLocalDate(),
                        (BigDecimal) row[1]
                ))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentReportResponse getAppointmentReport(
            LocalDate from, LocalDate to
    ) {
        validateDateRange(from, to);

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.atTime(LocalTime.MAX);

        long total      = appointmentRepository.countByDateRange(fromDt, toDt);
        long scheduled  = appointmentRepository
                .countByStatusAndDateRange(AppointmentStatus.SCHEDULED, fromDt, toDt);
        long confirmed  = appointmentRepository
                .countByStatusAndDateRange(AppointmentStatus.CONFIRMED, fromDt, toDt);
        long completed  = appointmentRepository
                .countByStatusAndDateRange(AppointmentStatus.COMPLETED, fromDt, toDt);
        long cancelled  = appointmentRepository
                .countByStatusAndDateRange(AppointmentStatus.CANCELLED, fromDt, toDt);
        long noShow     = appointmentRepository
                .countByStatusAndDateRange(AppointmentStatus.NO_SHOW, fromDt, toDt);

        // Build byType map
        List<Object[]> typeRows = appointmentRepository
                .countByTypeAndDateRange(fromDt, toDt);

        Map<String, Long> byType = new LinkedHashMap<>();
        Arrays.stream(AppointmentType.values())
                .forEach(t -> byType.put(t.name(), 0L));
        typeRows.forEach(row ->
                byType.put(((AppointmentType) row[0]).name(), (Long) row[1])
        );

        return new AppointmentReportResponse(
                total, scheduled, confirmed,
                completed, cancelled, noShow, byType
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PatientReportResponse getPatientReport(LocalDate from, LocalDate to) {
        validateDateRange(from, to);

        LocalDateTime fromDt = from.atStartOfDay();
        LocalDateTime toDt   = to.atTime(LocalTime.MAX);

        long totalPatients = patientRepository.countByDeletedFalse();
        long newPatients   = patientRepository
                .countNewPatientsByDateRange(fromDt, toDt);

        return new PatientReportResponse(totalPatients, newPatients);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private void validateDateRange(LocalDate from, LocalDate to) {
        if (from.isAfter(to)) {
            throw new IllegalArgumentException(
                    "Start date must be before end date");
        }
        if (from.plusYears(1).isBefore(to)) {
            throw new IllegalArgumentException(
                    "Date range cannot exceed 1 year");
        }
    }
}