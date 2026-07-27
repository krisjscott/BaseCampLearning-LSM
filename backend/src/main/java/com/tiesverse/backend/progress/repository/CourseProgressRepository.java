package com.tiesverse.backend.progress.repository;

import com.tiesverse.backend.progress.entity.CourseProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseProgressRepository extends JpaRepository<CourseProgress, UUID> {

    Optional<CourseProgress> findByUserIdAndCourseId(UUID userId, UUID courseId);

    List<CourseProgress> findByUserId(UUID userId);
}
