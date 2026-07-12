package com.sadbob.dentalclinic.appointment.mapper;

import com.sadbob.dentalclinic.appointment.dto.AppointmentRequest;
import com.sadbob.dentalclinic.appointment.dto.AppointmentResponse;
import com.sadbob.dentalclinic.appointment.dto.AppointmentSummary;
import com.sadbob.dentalclinic.appointment.entity.Appointment;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface AppointmentMapper {

    // Appointment → AppointmentResponse (full detail)
    @Mapping(target = "patientId",   source = "patient.id")
    @Mapping(target = "patientName", source = "patient.fullName")
    @Mapping(target = "dentistId",   source = "dentist.id")
    @Mapping(target = "dentistName", source = "dentist.fullName")
    AppointmentResponse toResponse(Appointment appointment);

    // Appointment → AppointmentSummary (list view)
    @Mapping(target = "patientName", source = "patient.fullName")
    @Mapping(target = "dentistName", source = "dentist.fullName")
    AppointmentSummary toSummary(Appointment appointment);

    // AppointmentRequest → Appointment (patient and dentist set in service)
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "patient",   ignore = true)
    @Mapping(target = "dentist",   ignore = true)
    @Mapping(target = "status",    ignore = true)
    @Mapping(target = "deleted",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    Appointment toEntity(AppointmentRequest request);

    // AppointmentRequest → existing Appointment (for update)
    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "patient",   ignore = true)
    @Mapping(target = "dentist",   ignore = true)
    @Mapping(target = "status",    ignore = true)
    @Mapping(target = "deleted",   ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntity(AppointmentRequest request, @MappingTarget Appointment appointment);
}