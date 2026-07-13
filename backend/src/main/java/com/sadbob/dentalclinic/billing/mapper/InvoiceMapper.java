package com.sadbob.dentalclinic.billing.mapper;

import com.sadbob.dentalclinic.billing.dto.InvoiceItemRequest;
import com.sadbob.dentalclinic.billing.dto.InvoiceItemResponse;
import com.sadbob.dentalclinic.billing.dto.InvoiceResponse;
import com.sadbob.dentalclinic.billing.dto.InvoiceSummary;
import com.sadbob.dentalclinic.billing.entity.Invoice;
import com.sadbob.dentalclinic.billing.entity.InvoiceItem;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface InvoiceMapper {

    // Invoice → InvoiceResponse (full detail)
    @Mapping(target = "patientId",     source = "patient.id")
    @Mapping(target = "patientName",   source = "patient.fullName")
    @Mapping(target = "appointmentId", source = "appointment.id")
    InvoiceResponse toResponse(Invoice invoice);

    // Invoice → InvoiceSummary (list view)
    @Mapping(target = "patientName", source = "patient.fullName")
    InvoiceSummary toSummary(Invoice invoice);

    // InvoiceItem → InvoiceItemResponse
    InvoiceItemResponse toItemResponse(InvoiceItem item);

    // InvoiceItemRequest → InvoiceItem
    @Mapping(target = "id",      ignore = true)
    @Mapping(target = "invoice", ignore = true)
    @Mapping(target = "subtotal", ignore = true)
    InvoiceItem toItemEntity(InvoiceItemRequest request);
}