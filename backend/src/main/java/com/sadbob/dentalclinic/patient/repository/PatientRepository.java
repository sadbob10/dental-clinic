package com.sadbob.dentalclinic.patient.repository;

import com.sadbob.dentalclinic.patient.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByIdAndDeletedFalse(Long id);

    boolean existsByPhoneAndDeletedFalse(String phone);

    @Query("""
            SELECT p FROM Patient p
            WHERE p.deleted = false
            AND (
                LOWER(p.fullName) LIKE LOWER(CONCAT('%', :search, '%'))
                OR p.phone LIKE CONCAT('%', :search, '%')
            )
            """)
    Page<Patient> searchPatients(@Param("search") String search, Pageable pageable);

    Page<Patient> findAllByDeletedFalse(Pageable pageable);
}