package com.sadbob.dentalclinic.billing.mapper;

import com.sadbob.dentalclinic.billing.dto.PaymentResponse;
import com.sadbob.dentalclinic.billing.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface PaymentMapper {

    @Mapping(target = "invoiceId", source = "invoice.id")
    PaymentResponse toResponse(Payment payment);
}