package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.dto.ChangePasswordRequest;
import com.sadbob.dentalclinic.auth.dto.UserRequest;
import com.sadbob.dentalclinic.auth.dto.UserResponse;
import com.sadbob.dentalclinic.auth.dto.UserSummary;
import com.sadbob.dentalclinic.auth.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {

    UserResponse create(UserRequest request);

    UserResponse getById(Long id);

    UserResponse getByEmail(String email);

    Page<UserSummary> getAll(Role role, Pageable pageable);

    List<UserSummary> getDentists();

    UserResponse update(Long id, UserRequest request);

    UserResponse updateStatus(Long id, boolean isActive, String requestedByEmail);

    void changePassword(String email, ChangePasswordRequest request);
}