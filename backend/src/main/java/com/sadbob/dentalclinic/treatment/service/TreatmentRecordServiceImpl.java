package com.sadbob.dentalclinic.treatment.service;

import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.appointment.repository.AppointmentRepository;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.repository.UserRepository;
import com.sadbob.dentalclinic.patient.entity.Patient;
import com.sadbob.dentalclinic.patient.repository.PatientRepository;
import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordRequest;
import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordResponse;
import com.sadbob.dentalclinic.treatment.entity.TreatmentRecord;
import com.sadbob.dentalclinic.treatment.mapper.TreatmentRecordMapper;
import com.sadbob.dentalclinic.treatment.repository.TreatmentRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class TreatmentRecordServiceImpl implements TreatmentRecordService {

    private final TreatmentRecordRepository treatmentRecordRepository;
    private final PatientRepository         patientRepository;
    private final AppointmentRepository     appointmentRepository;
    private final UserRepository            userRepository;
    private final TreatmentRecordMapper     treatmentRecordMapper;

    @Override
    @Transactional
    public TreatmentRecordResponse create(TreatmentRecordRequest request) {
        Patient patient = patientRepository.findByIdAndDeletedFalse(request.patientId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Patient not found with id: " + request.patientId()));

        User dentist = userRepository.findById(request.dentistId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "Dentist not found with id: " + request.dentistId()));

        Appointment appointment = null;
        if (request.appointmentId() != null) {
            appointment = appointmentRepository
                    .findByIdAndDeletedFalse(request.appointmentId())
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Appointment not found with id: " + request.appointmentId()));

            if (treatmentRecordRepository.existsByAppointment_Id(request.appointmentId())) {
                throw new IllegalArgumentException(
                        "A treatment record already exists for appointment id: "
                                + request.appointmentId());
            }
        }

        TreatmentRecord record = treatmentRecordMapper.toEntity(request);
        record.setPatient(patient);
        record.setDentist(dentist);
        record.setAppointment(appointment);

        TreatmentRecord saved = treatmentRecordRepository.save(record);

        log.info("Treatment record created: id={}, patient={}, dentist={}",
                saved.getId(), patient.getFullName(), dentist.getFullName());

        return treatmentRecordMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentRecordResponse getById(Long id) {
        return treatmentRecordMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TreatmentRecordResponse> getByPatient(Long patientId) {
        if (!patientRepository.existsByPhoneAndDeletedFalse(
                patientRepository.findByIdAndDeletedFalse(patientId)
                        .orElseThrow(() -> new EntityNotFoundException(
                                "Patient not found with id: " + patientId))
                        .getPhone())) {
            throw new EntityNotFoundException("Patient not found with id: " + patientId);
        }

        return treatmentRecordRepository
                .findByPatient_IdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(treatmentRecordMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TreatmentRecordResponse getByAppointment(Long appointmentId) {
        return treatmentRecordMapper.toResponse(
                treatmentRecordRepository.findByAppointment_Id(appointmentId)
                        .orElseThrow(() -> new EntityNotFoundException(
                                "No treatment record found for appointment id: "
                                        + appointmentId))
        );
    }

    @Override
    @Transactional
    public TreatmentRecordResponse update(Long id, TreatmentRecordRequest request) {
        TreatmentRecord record = findOrThrow(id);

        treatmentRecordMapper.updateEntity(request, record);

        TreatmentRecord updated = treatmentRecordRepository.save(record);

        log.info("Treatment record updated: id={}", updated.getId());

        return treatmentRecordMapper.toResponse(updated);
    }

    private TreatmentRecord findOrThrow(Long id) {
        return treatmentRecordRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Treatment record not found with id: " + id));
    }
}