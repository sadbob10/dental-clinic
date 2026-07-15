package com.sadbob.dentalclinic.auth.mapper;

import com.sadbob.dentalclinic.auth.dto.UserRequest;
import com.sadbob.dentalclinic.auth.dto.UserResponse;
import com.sadbob.dentalclinic.auth.dto.UserSummary;
import com.sadbob.dentalclinic.auth.entity.User;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserMapper {

    @Mapping(target = "isActive", source = "active")
    UserResponse toResponse(User user);

    @Mapping(target = "isActive", source = "active")
    UserSummary toSummary(User user);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "isActive",  ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    User toEntity(UserRequest request);

    @Mapping(target = "id",        ignore = true)
    @Mapping(target = "password",  ignore = true)
    @Mapping(target = "active",    ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(UserRequest request, @MappingTarget User user);
}