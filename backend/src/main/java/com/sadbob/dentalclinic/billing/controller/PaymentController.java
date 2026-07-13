package com.sadbob.dentalclinic.billing.controller;

import com.sadbob.dentalclinic.billing.dto.PaymentRequest;
import com.sadbob.dentalclinic.billing.dto.PaymentResponse;
import com.sadbob.dentalclinic.billing.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices/{invoiceId}/payments")
@RequiredArgsConstructor
@Tag(name = "Payments", description = "Invoice payment tracking")
@SecurityRequirement(name = "bearerAuth")
public class PaymentController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Record a payment for an invoice")
    public ResponseEntity<PaymentResponse> addPayment(
            @PathVariable Long invoiceId,
            @Valid @RequestBody PaymentRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.addPayment(invoiceId, request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "List all payments for an invoice")
    public ResponseEntity<List<PaymentResponse>> getPayments(
            @PathVariable Long invoiceId
    ) {
        return ResponseEntity.ok(invoiceService.getPayments(invoiceId));
    }
}