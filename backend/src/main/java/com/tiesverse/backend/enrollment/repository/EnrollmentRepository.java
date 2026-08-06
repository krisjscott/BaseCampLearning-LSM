package com.tiesverse.backend.enrollment.repository;

import com.tiesverse.backend.enrollment.entity.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, UUID> {

    List<Enrollment> findByUserId(UUID userId);

    List<Enrollment> findByCourseId(UUID courseId);

    Optional<Enrollment> findByUserIdAndCourseId(UUID userId, UUID courseId);

    List<Enrollment> findByUserIdAndStatus(UUID userId, com.tiesverse.backend.common.enums.EnrollmentStatus status);

    long countByCourseId(UUID courseId);

    long countByStatus(com.tiesverse.backend.common.enums.EnrollmentStatus status);

    void deleteByCourseId(UUID courseId);
}
