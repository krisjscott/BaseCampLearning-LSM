package com.tiesverse.backend.certificate.repository;

import com.tiesverse.backend.certificate.entity.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CertificateRepository extends JpaRepository<Certificate, UUID> {

    List<Certificate> findByUserId(UUID userId);

    Optional<Certificate> findByUserIdAndCourseId(UUID userId, UUID courseId);

    Optional<Certificate> findByCertificateNumber(String certificateNumber);

    long countByCourseId(UUID courseId);
}
