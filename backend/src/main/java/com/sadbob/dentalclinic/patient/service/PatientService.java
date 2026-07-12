package com.sadbob.dentalclinic.patient.service;

import com.sadbob.dentalclinic.patient.dto.PatientRequest;
import com.sadbob.dentalclinic.patient.dto.PatientResponse;
import com.sadbob.dentalclinic.patient.dto.PatientSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PatientService {

    PatientResponse create(PatientRequest request, String createdBy);

    PatientResponse getById(Long id);

    Page<PatientSummary> getAll(String search, Pageable pageable);

    PatientResponse update(Long id, PatientRequest request);

    void delete(Long id);
}