package com.sadbob.dentalclinic.patient.service;

import com.sadbob.dentalclinic.appointment.dto.AppointmentSummary;
import com.sadbob.dentalclinic.billing.dto.InvoiceSummary;
import com.sadbob.dentalclinic.patient.dto.PatientRequest;
import com.sadbob.dentalclinic.patient.dto.PatientResponse;
import com.sadbob.dentalclinic.patient.dto.PatientSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PatientService {

    PatientResponse create(PatientRequest request, String createdBy);

    PatientResponse getById(Long id);

    Page<PatientSummary> getAll(String search, Pageable pageable);

    PatientResponse update(Long id, PatientRequest request);

    void delete(Long id);

    PatientResponse getByPhone(String phone);

    List<AppointmentSummary> getPatientAppointments(Long patientId);

    List<InvoiceSummary> getPatientInvoices(Long patientId);
}