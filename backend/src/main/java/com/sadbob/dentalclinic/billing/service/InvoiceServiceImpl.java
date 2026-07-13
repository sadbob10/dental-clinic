package com.sadbob.dentalclinic.billing.service;

import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.appointment.repository.AppointmentRepository;
import com.sadbob.dentalclinic.billing.dto.InvoiceRequest;
import com.sadbob.dentalclinic.billing.dto.InvoiceResponse;
import com.sadbob.dentalclinic.billing.dto.InvoiceSummary;
import com.sadbob.dentalclinic.billing.dto.PaymentRequest;
import com.sadbob.dentalclinic.billing.dto.PaymentResponse;
import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.billing.entity.InvoiceItem;
import com.sadbob.dentalclinic.billing.entity.Payment;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import com.sadbob.dentalclinic.billing.mapper.InvoiceMapper;
import com.sadbob.dentalclinic.billing.mapper.PaymentMapper;
import com.sadbob.dentalclinic.billing.repository.InvoiceRepository;
import com.sadbob.dentalclinic.billing.repository.PaymentRepository;
import com.sadbob.dentalclinic.patient.entity.Patient;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository     invoiceRepository;
    private final PaymentRepository     paymentRepository;
    private final PatientRepository     patientRepository;
    private final AppointmentRepository appointmentRepository;
    private final InvoiceMapper         invoiceMapper;
    private final PaymentMapper         paymentMapper;

    @Override
    @Transactional
    public InvoiceResponse create(InvoiceRequest request, String createdBy) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + request.patientId()));

        Appointment appointment = null;
        if (request.appointmentId() != null) {
            appointment = appointmentRepository
                    .findByIdAndDeletedFalse(request.appointmentId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Appointment not found with id: " + request.appointmentId()));
        }

        Invoice invoice = Invoice.builder()
                .patient(patient)
                .appointment(appointment)
                .notes(request.notes())
                .dueDate(request.dueDate())
                .createdBy(createdBy)
                .build();

        // Build items and calculate totals
        List<InvoiceItem> items = buildItems(request, invoice);
        invoice.getItems().addAll(items);
        calculateTotals(invoice, request.discount());

        Invoice saved = invoiceRepository.save(invoice);

        log.info("Invoice created: id={}, patient={}, net={}",
                saved.getId(), patient.getFullName(), saved.getNetAmount());

        return invoiceMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public InvoiceResponse getById(Long id) {
        return invoiceMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InvoiceSummary> getAll(
            Long patientId, InvoiceStatus status, Pageable pageable
    ) {
        if (patientId != null) {
            return invoiceRepository
                    .findByPatient_Id(patientId, pageable)
                    .map(invoiceMapper::toSummary);
        }
        if (status != null) {
            return invoiceRepository
                    .findByStatus(status, pageable)
                    .map(invoiceMapper::toSummary);
        }
        return invoiceRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(invoiceMapper::toSummary);
    }

    @Override
    @Transactional
    public InvoiceResponse update(Long id, InvoiceRequest request) {
        Invoice invoice = findOrThrow(id);

        if (!invoice.getStatus().isEditable()) {
            throw new IllegalStateException(
                    "Invoice can only be edited in DRAFT status. Current: "
                            + invoice.getStatus());
        }

        invoice.setNotes(request.notes());
        invoice.setDueDate(request.dueDate());

        // Replace items
        invoice.getItems().clear();
        List<InvoiceItem> items = buildItems(request, invoice);
        invoice.getItems().addAll(items);
        calculateTotals(invoice, request.discount());

        Invoice updated = invoiceRepository.save(invoice);

        log.info("Invoice updated: id={}", updated.getId());

        return invoiceMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public InvoiceResponse updateStatus(Long id, InvoiceStatus status) {
        Invoice invoice = findOrThrow(id);

        if (!invoice.getStatus().canTransitionTo(status)) {
            throw new IllegalStateException(
                    "Cannot transition invoice from "
                            + invoice.getStatus() + " to " + status);
        }

        invoice.setStatus(status);
        if (status == InvoiceStatus.ISSUED) {
            invoice.setIssuedAt(LocalDateTime.now());
        }

        Invoice updated = invoiceRepository.save(invoice);

        log.info("Invoice {} status changed to {}", id, status);

        return invoiceMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public PaymentResponse addPayment(Long invoiceId, PaymentRequest request) {
        Invoice invoice = findOrThrow(invoiceId);

        if (!invoice.getStatus().canAcceptPayment()) {
            throw new IllegalStateException(
                    "Invoice cannot accept payments in status: "
                            + invoice.getStatus());
        }

        // Check for overpayment
        BigDecimal totalPaid = paymentRepository
                .sumPaidByInvoiceId(invoiceId);
        BigDecimal remaining = invoice.getNetAmount().subtract(totalPaid);

        if (request.amountPaid().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount exceeds remaining balance of " + remaining);
        }

        Payment payment = Payment.builder()
                .invoice(invoice)
                .amountPaid(request.amountPaid())
                .paymentMethod(request.paymentMethod())
                .referenceNumber(request.referenceNumber())
                .notes(request.notes())
                .build();

        paymentRepository.save(payment);

        // Auto-update invoice status
        BigDecimal newTotalPaid = totalPaid.add(request.amountPaid());
        if (newTotalPaid.compareTo(invoice.getNetAmount()) >= 0) {
            invoice.setStatus(InvoiceStatus.PAID);
        } else {
            invoice.setStatus(InvoiceStatus.PARTIALLY_PAID);
        }
        invoiceRepository.save(invoice);

        log.info("Payment recorded: invoice={}, amount={}, method={}",
                invoiceId, request.amountPaid(), request.paymentMethod());

        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPayments(Long invoiceId) {
        findOrThrow(invoiceId); // verify invoice exists
        return paymentRepository
                .findByInvoice_IdOrderByPaidAtDesc(invoiceId)
                .stream()
                .map(paymentMapper::toResponse)
                .toList();
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private Invoice findOrThrow(Long id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Invoice not found with id: " + id));
    }

    private List<InvoiceItem> buildItems(InvoiceRequest request, Invoice invoice) {
        return request.items().stream().map(itemRequest -> {
            InvoiceItem item = invoiceMapper.toItemEntity(itemRequest);
            item.setInvoice(invoice);
            item.setSubtotal(
                    itemRequest.unitPrice()
                            .multiply(BigDecimal.valueOf(itemRequest.quantity()))
            );
            return item;
        }).toList();
    }

    private void calculateTotals(Invoice invoice, BigDecimal discount) {
        BigDecimal total = invoice.getItems().stream()
                .map(InvoiceItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal appliedDiscount = discount != null ? discount : BigDecimal.ZERO;
        BigDecimal net = total.subtract(appliedDiscount);

        invoice.setTotalAmount(total);
        invoice.setDiscount(appliedDiscount);
        invoice.setNetAmount(net.compareTo(BigDecimal.ZERO) < 0
                ? BigDecimal.ZERO : net);
    }
}