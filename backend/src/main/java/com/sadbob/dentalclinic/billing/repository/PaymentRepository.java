package com.sadbob.dentalclinic.billing.repository;

import com.sadbob.dentalclinic.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // All payments for an invoice
    List<Payment> findByInvoice_IdOrderByPaidAtDesc(Long invoiceId);

    // Total amount paid for an invoice
    @Query("""
            SELECT COALESCE(SUM(p.amountPaid), 0)
            FROM Payment p
            WHERE p.invoice.id = :invoiceId
            """)
    BigDecimal sumPaidByInvoiceId(@Param("invoiceId") Long invoiceId);

    // Total collected in date range
    @Query("""
        SELECT COALESCE(SUM(p.amountPaid), 0) FROM Payment p
        WHERE p.paidAt >= :from
        AND p.paidAt <= :to
        """)
    BigDecimal sumCollectedByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    // Daily revenue breakdown
    @Query("""
        SELECT CAST(p.paidAt AS date), COALESCE(SUM(p.amountPaid), 0)
        FROM Payment p
        WHERE p.paidAt >= :from
        AND p.paidAt <= :to
        GROUP BY CAST(p.paidAt AS date)
        ORDER BY CAST(p.paidAt AS date) ASC
        """)
    List<Object[]> dailyCollectedByDateRange(
            @Param("from") LocalDateTime from,
            @Param("to") LocalDateTime to
    );
}