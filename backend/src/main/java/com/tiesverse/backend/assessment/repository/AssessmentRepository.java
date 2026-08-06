package com.tiesverse.backend.assessment.repository;

import com.tiesverse.backend.assessment.entity.Assessment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AssessmentRepository extends JpaRepository<Assessment, UUID> {

    List<Assessment> findByCourseId(UUID courseId);

    void deleteByCourseId(UUID courseId);
}
