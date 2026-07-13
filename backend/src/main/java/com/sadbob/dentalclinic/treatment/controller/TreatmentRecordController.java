package com.sadbob.dentalclinic.treatment.controller;

import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordRequest;
import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordResponse;
import com.sadbob.dentalclinic.treatment.service.TreatmentRecordService;
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
@RequestMapping("/api/treatment-records")
@RequiredArgsConstructor
@Tag(name = "Treatment Records", description = "Patient treatment history")
@SecurityRequirement(name = "bearerAuth")
public class TreatmentRecordController {

    private final TreatmentRecordService treatmentRecordService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DENTIST')")
    @Operation(summary = "Create a treatment record")
    public ResponseEntity<TreatmentRecordResponse> create(
            @Valid @RequestBody TreatmentRecordRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(treatmentRecordService.create(request));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "Get treatment record by ID")
    public ResponseEntity<TreatmentRecordResponse> getById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(treatmentRecordService.getById(id));
    }

    @GetMapping("/patient/{patientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "Get all treatment records for a patient")
    public ResponseEntity<List<TreatmentRecordResponse>> getByPatient(
            @PathVariable Long patientId
    ) {
        return ResponseEntity.ok(treatmentRecordService.getByPatient(patientId));
    }

    @GetMapping("/appointment/{appointmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST', 'DENTIST')")
    @Operation(summary = "Get treatment record for a specific appointment")
    public ResponseEntity<TreatmentRecordResponse> getByAppointment(
            @PathVariable Long appointmentId
    ) {
        return ResponseEntity.ok(treatmentRecordService.getByAppointment(appointmentId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DENTIST')")
    @Operation(summary = "Update a treatment record")
    public ResponseEntity<TreatmentRecordResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody TreatmentRecordRequest request
    ) {
        return ResponseEntity.ok(treatmentRecordService.update(id, request));
    }
}