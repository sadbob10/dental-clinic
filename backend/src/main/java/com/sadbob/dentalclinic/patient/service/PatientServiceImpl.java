package com.sadbob.dentalclinic.patient.service;

import com.sadbob.dentalclinic.patient.dto.PatientRequest;
import com.sadbob.dentalclinic.patient.dto.PatientResponse;
import com.sadbob.dentalclinic.patient.dto.PatientSummary;
import com.sadbob.dentalclinic.patient.entity.Patient;
import com.sadbob.dentalclinic.patient.mapper.PatientMapper;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PatientServiceImpl implements PatientService {

    private final PatientRepository patientRepository;
    private final PatientMapper patientMapper;

    @Override
    @Transactional
    public PatientResponse create(PatientRequest request, String createdBy) {
        if (patientRepository.existsByPhoneAndDeletedFalse(request.phone())) {
            throw new IllegalArgumentException(
                    "Patient with phone number " + request.phone() + " already exists"
            );
        }

        Patient patient = patientMapper.toEntity(request);
        patient.setCreatedBy(createdBy);
        Patient saved = patientRepository.save(patient);

        log.info("Patient created: id={}, name={}, by={}",
                saved.getId(), saved.getFullName(), createdBy);

        return patientMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PatientResponse getById(Long id) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + id
                ));
        return patientMapper.toResponse(patient);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PatientSummary> getAll(String search, Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return patientRepository.searchPatients(search, pageable)
                    .map(patientMapper::toSummary);
        }
        return patientRepository.findAllByDeletedFalse(pageable)
                .map(patientMapper::toSummary);
    }

    @Override
    @Transactional
    public PatientResponse update(Long id, PatientRequest request) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + id
                ));

        // Check phone uniqueness only if phone is being changed
        if (!patient.getPhone().equals(request.phone()) &&
                patientRepository.existsByPhoneAndDeletedFalse(request.phone())) {
            throw new IllegalArgumentException(
                    "Phone number " + request.phone() + " is already in use"
            );
        }

        patientMapper.updateEntity(request, patient);
        Patient updated = patientRepository.save(patient);

        log.info("Patient updated: id={}, name={}", updated.getId(), updated.getFullName());

        return patientMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + id
                ));

        patient.setDeleted(true);
        patientRepository.save(patient);

        log.info("Patient soft-deleted: id={}, name={}", patient.getId(), patient.getFullName());
    }
}