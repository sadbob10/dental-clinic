package com.sadbob.dentalclinic.auth.service;

import com.sadbob.dentalclinic.auth.dto.ChangePasswordRequest;
import com.sadbob.dentalclinic.auth.dto.UserRequest;
import com.sadbob.dentalclinic.auth.dto.UserResponse;
import com.sadbob.dentalclinic.auth.dto.UserSummary;
import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.enums.Role;
import com.sadbob.dentalclinic.auth.mapper.UserMapper;
import com.sadbob.dentalclinic.auth.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository  userRepository;
    private final UserMapper      userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse create(UserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException(
                    "Email already in use: " + request.email());
        }

        User user = userMapper.toEntity(request);
        user.setPassword(passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);

        log.info("Staff account created: id={}, email={}, role={}",
                saved.getId(), saved.getEmail(), saved.getRole());

        return userMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long id) {
        return userMapper.toResponse(findOrThrow(id));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByEmail(String email) {
        return userMapper.toResponse(
                userRepository.findByEmail(email)
                        .orElseThrow(() -> new EntityNotFoundException(
                                "User not found: " + email))
        );
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserSummary> getAll(Role role, Pageable pageable) {
        if (role != null) {
            return userRepository
                    .findByRoleOrderByCreatedAtDesc(role, pageable)
                    .map(userMapper::toSummary);
        }
        return userRepository
                .findAllByOrderByCreatedAtDesc(pageable)
                .map(userMapper::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummary> getDentists() {
        return userRepository
                .findByRoleAndIsActiveTrueOrderByFullNameAsc(Role.DENTIST)
                .stream()
                .map(userMapper::toSummary)
                .toList();
    }

    @Override
    @Transactional
    public UserResponse update(Long id, UserRequest request) {
        User user = findOrThrow(id);

        if (userRepository.existsByEmailAndIdNot(request.email(), id)) {
            throw new IllegalArgumentException(
                    "Email already in use: " + request.email());
        }

        userMapper.updateEntity(request, user);
        User updated = userRepository.save(user);

        log.info("Staff account updated: id={}, email={}", updated.getId(), updated.getEmail());

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, boolean isActive, String requestedByEmail) {
        User user = findOrThrow(id);

        if (user.getEmail().equals(requestedByEmail)) {
            throw new IllegalArgumentException(
                    "You cannot deactivate your own account");
        }

        user.setActive(isActive);
        User updated = userRepository.save(user);

        log.info("Staff account {} {}: id={}",
                isActive ? "activated" : "deactivated",
                updated.getEmail(), updated.getId());

        return userMapper.toResponse(updated);
    }

    @Override
    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new IllegalArgumentException(
                    "New password and confirm password do not match");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found: " + email));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        log.info("Password changed for user: {}", email);
    }

    private User findOrThrow(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(
                        "User not found with id: " + id));
    }
}