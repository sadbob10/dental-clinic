package com.sadbob.dentalclinic.auth.repository;

import com.sadbob.dentalclinic.auth.entity.User;
import com.sadbob.dentalclinic.auth.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // Find all active users by role (for dentist dropdown)
    List<User> findByRoleAndIsActiveTrue(Role role);

    // Find all users paginated
    Page<User> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // Find by role paginated
    Page<User> findByRoleOrderByCreatedAtDesc(Role role, Pageable pageable);

    // Check email exists (excluding current user — for update)
    boolean existsByEmailAndIdNot(String email, Long id);

    // Find all active dentists
    List<User> findByRoleAndIsActiveTrueOrderByFullNameAsc(Role role);

}