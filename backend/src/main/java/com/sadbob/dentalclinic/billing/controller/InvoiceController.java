package com.sadbob.dentalclinic.billing.controller;

import com.sadbob.dentalclinic.billing.dto.InvoiceRequest;
import com.sadbob.dentalclinic.billing.dto.InvoiceResponse;
import com.sadbob.dentalclinic.billing.dto.InvoiceSummary;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import com.sadbob.dentalclinic.billing.service.InvoiceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
@Tag(name = "Invoices", description = "Invoice management")
@SecurityRequirement(name = "bearerAuth")
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Create a new invoice")
    public ResponseEntity<InvoiceResponse> create(
            @Valid @RequestBody InvoiceRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(invoiceService.create(request, userDetails.getUsername()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "List invoices with optional filters")
    public ResponseEntity<Page<InvoiceSummary>> getAll(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(
                invoiceService.getAll(patientId, status, pageable)
        );
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "Get invoice by ID with items")
    public ResponseEntity<InvoiceResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(invoiceService.getById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Update invoice (DRAFT only)")
    public ResponseEntity<InvoiceResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceRequest request
    ) {
        return ResponseEntity.ok(invoiceService.update(id, request));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    @Operation(summary = "Update invoice status (issue or cancel)")
    public ResponseEntity<InvoiceResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status
    ) {
        return ResponseEntity.ok(invoiceService.updateStatus(id, status));
    }
}