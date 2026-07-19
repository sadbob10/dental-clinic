package com.sadbob.dentalclinic.auth.repository;

import com.sadbob.dentalclinic.auth.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    Optional<RefreshToken> findByToken(String token);

    // Revoke all tokens for a user (on logout or password change)
    @Modifying
    @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user.id = :userId")
    void revokeAllByUserId(@Param("userId") Long userId);

    // Delete expired tokens (cleanup)
    @Modifying
    @Query("""
            DELETE FROM RefreshToken r
            WHERE r.expiresAt < CURRENT_TIMESTAMP
            OR r.revoked = true
            """)
    void deleteExpiredAndRevoked();
}