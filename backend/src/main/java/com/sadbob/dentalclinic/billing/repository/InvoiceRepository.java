package com.sadbob.dentalclinic.billing.repository;

import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import java.util.List;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    // All invoices for a patient
    List<Invoice> findByPatient_IdOrderByCreatedAtDesc(Long patientId);

    // Filter by status paginated
    Page<Invoice> findByStatus(InvoiceStatus status, Pageable pageable);

    // All invoices paginated
    Page<Invoice> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Filter by patient paginated
    Page<Invoice> findByPatient_Id(Long patientId, Pageable pageable);

    // Revenue summary — count by status in date range
    @Query("""
        SELECT COUNT(i) FROM Invoice i
        WHERE i.createdAt >= :from
        AND i.createdAt <= :to
        AND i.status = :status
        """)
    long countByStatusAndDateRange(
            @Param("status") InvoiceStatus status,
            @Param("from") LocalDateTime from,
            @Param("to")     LocalDateTime to
    );

    // Total invoiced amount in date range (excluding cancelled)
    @Query("""
        SELECT COALESCE(SUM(i.netAmount), 0) FROM Invoice i
        WHERE i.createdAt >= :from
        AND i.createdAt <= :to
        AND i.status <> com.sadbob.dentalclinic.billing.enums.InvoiceStatus.CANCELLED
        """)
    BigDecimal sumNetAmountByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Total discount in date range
    @Query("""
        SELECT COALESCE(SUM(i.discount), 0) FROM Invoice i
        WHERE i.createdAt >= :from
        AND i.createdAt <= :to
        AND i.status <> com.sadbob.dentalclinic.billing.enums.InvoiceStatus.CANCELLED
        """)
    BigDecimal sumDiscountByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );
}