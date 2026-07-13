package com.sadbob.dentalclinic.treatment.mapper;

import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordRequest;
import com.sadbob.dentalclinic.treatment.dto.TreatmentRecordResponse;
import com.sadbob.dentalclinic.treatment.entity.TreatmentRecord;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface TreatmentRecordMapper {

    // TreatmentRecord → TreatmentRecordResponse
    @Mapping(target = "patientId",    source = "patient.id")
    @Mapping(target = "patientName",  source = "patient.fullName")
    @Mapping(target = "appointmentId", source = "appointment.id")
    @Mapping(target = "dentistId",    source = "dentist.id")
    @Mapping(target = "dentistName",  source = "dentist.fullName")
    TreatmentRecordResponse toResponse(TreatmentRecord record);

    // TreatmentRecordRequest → TreatmentRecord (patient, appointment, dentist set in service)
    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "patient",     ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "dentist",     ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    TreatmentRecord toEntity(TreatmentRecordRequest request);

    // TreatmentRecordRequest → existing TreatmentRecord (for update)
    @Mapping(target = "id",          ignore = true)
    @Mapping(target = "patient",     ignore = true)
    @Mapping(target = "appointment", ignore = true)
    @Mapping(target = "dentist",     ignore = true)
    @Mapping(target = "createdAt",   ignore = true)
    @Mapping(target = "updatedAt",   ignore = true)
    void updateEntity(TreatmentRecordRequest request,
                      @MappingTarget TreatmentRecord record);
}