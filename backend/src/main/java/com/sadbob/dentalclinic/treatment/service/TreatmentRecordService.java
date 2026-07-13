package com.sadbob.dentalclinic.treatment.service;

import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordRequest;
import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordResponse;

import java.util.List;

public interface TreatmentRecordService {

    TreatmentRecordResponse create(TreatmentRecordRequest request);

    TreatmentRecordResponse getById(Long id);

    List<TreatmentRecordResponse> getByPatient(Long patientId);

    TreatmentRecordResponse getByAppointment(Long appointmentId);

    TreatmentRecordResponse update(Long id, TreatmentRecordRequest request);
}