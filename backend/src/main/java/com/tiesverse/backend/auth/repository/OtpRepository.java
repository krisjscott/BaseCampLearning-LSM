package com.tiesverse.backend.auth.repository;

import com.tiesverse.backend.auth.entity.Otp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findFirstByEmailAndTypeAndUsedAtIsNullOrderByCreatedAtDesc(String email, String type);
    void deleteByEmailAndType(String email, String type);
}
