package com.tiesverse.backend.assignment.repository;

import com.tiesverse.backend.assignment.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AssignmentSubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    Optional<AssignmentSubmission> findByLessonIdAndUserId(UUID lessonId, UUID userId);

    List<AssignmentSubmission> findByLessonIdOrderByCreatedAtDesc(UUID lessonId);

    Optional<AssignmentSubmission> findByFileUrl(String fileUrl);
}
