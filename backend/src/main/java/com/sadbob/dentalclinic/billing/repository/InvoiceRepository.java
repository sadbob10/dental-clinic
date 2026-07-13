package com.sadbob.dentalclinic.billing.repository;

import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.billing.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

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
}