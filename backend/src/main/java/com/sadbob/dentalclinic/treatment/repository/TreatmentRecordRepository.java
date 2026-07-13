package com.sadbob.dentalclinic.treatment.repository;

import com.sadbob.dentalclinic.treatment.entity.TreatmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TreatmentRecordRepository extends JpaRepository<TreatmentRecord, Long> {

    // All treatment records for a patient, newest first
    List<TreatmentRecord> findByPatient_IdOrderByCreatedAtDesc(Long patientId);

    // Treatment record linked to a specific appointment
    Optional<TreatmentRecord> findByAppointment_Id(Long appointmentId);

    // Check if a record already exists for this appointment
    boolean existsByAppointment_Id(Long appointmentId);
}