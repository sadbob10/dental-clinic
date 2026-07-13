package com.sadbob.dentalclinic.appointment.repository;

import com.sadbob.dentalclinic.appointment.entity.Appointment;
import com.sadbob.dentalclinic.appointment.enums.AppointmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByIdAndDeletedFalse(Long id);

    // Used when NO filters provided
    Page<Appointment> findAllByDeletedFalse(Pageable pageable);

    // Filter by dentist only
    Page<Appointment> findByDeletedFalseAndDentist_Id(Long dentistId, Pageable pageable);

    // Filter by patient only
    Page<Appointment> findByDeletedFalseAndPatient_Id(Long patientId, Pageable pageable);

    // Filter by status only
    Page<Appointment> findByDeletedFalseAndStatus(AppointmentStatus status, Pageable pageable);

    // Filter by date range
    Page<Appointment> findByDeletedFalseAndScheduledAtBetween(
            LocalDateTime from, LocalDateTime to, Pageable pageable);

    // Today's appointments
    @Query("""
            SELECT a FROM Appointment a
            WHERE a.deleted = false
            AND a.scheduledAt >= :startOfDay
            AND a.scheduledAt <= :endOfDay
            ORDER BY a.scheduledAt ASC
            """)
    List<Appointment> findTodayAppointments(
            @Param("startOfDay") LocalDateTime startOfDay,
            @Param("endOfDay")   LocalDateTime endOfDay
    );

    // Conflict check
    @Query("""
            SELECT COUNT(a) > 0 FROM Appointment a
            WHERE a.deleted = false
            AND a.dentist.id = :dentistId
            AND a.id <> :excludeId
            AND a.status NOT IN (
                com.sadbob.dentalclinic.appointment.enums.AppointmentStatus.CANCELLED,
                com.sadbob.dentalclinic.appointment.enums.AppointmentStatus.NO_SHOW
            )
            AND a.scheduledAt < :endTime
            AND a.scheduledAt > :startTime
            """)
    boolean hasConflict(
            @Param("dentistId")  Long dentistId,
            @Param("startTime")  LocalDateTime startTime,
            @Param("endTime")    LocalDateTime endTime,
            @Param("excludeId")  Long excludeId
    );

    // Count appointments by status in date range
    @Query("""
        SELECT COUNT(a) FROM Appointment a
        WHERE a.deleted = false
        AND a.scheduledAt >= :from
        AND a.scheduledAt <= :to
        AND a.status = :status
        """)
    long countByStatusAndDateRange(
            @Param("status") AppointmentStatus status,
            @Param("from")   LocalDateTime from,
            @Param("to")     LocalDateTime to
    );

    // Count appointments by type in date range
    @Query("""
        SELECT a.type, COUNT(a) FROM Appointment a
        WHERE a.deleted = false
        AND a.scheduledAt >= :from
        AND a.scheduledAt <= :to
        GROUP BY a.type
        """)
    List<Object[]> countByTypeAndDateRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Total appointments in date range
    @Query("""
        SELECT COUNT(a) FROM Appointment a
        WHERE a.deleted = false
        AND a.scheduledAt >= :from
        AND a.scheduledAt <= :to
        """)
    long countByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );
}