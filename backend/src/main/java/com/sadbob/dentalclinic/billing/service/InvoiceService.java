package com.sadbob.dentalclinic.billing.service;

import com.sadbob.dentalclinic.billing.dto.InvoiceRequest;
import com.sadbob.dentalclinic.billing.dto.InvoiceResponse;
import com.sadbob.dentalclinic.billing.dto.InvoiceSummary;
import com.sadbob.dentalclinic.billing.dto.PaymentRequest;
import com.sadbob.dentalclinic.billing.dto.PaymentResponse;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface InvoiceService {

    InvoiceResponse create(InvoiceRequest request, String createdBy);

    InvoiceResponse getById(Long id);

    Page<InvoiceSummary> getAll(Long patientId, InvoiceStatus status, Pageable pageable);

    InvoiceResponse update(Long id, InvoiceRequest request);

    InvoiceResponse updateStatus(Long id, InvoiceStatus status);

    PaymentResponse addPayment(Long invoiceId, PaymentRequest request);

    List<PaymentResponse> getPayments(Long invoiceId);
}