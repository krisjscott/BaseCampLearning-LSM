package com.tiesverse.backend.enrollment.repository;

import com.tiesverse.backend.enrollment.entity.LearningPathCourse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LearningPathCourseRepository extends JpaRepository<LearningPathCourse, UUID> {

    List<LearningPathCourse> findByLearningPathIdOrderByOrderIndex(UUID learningPathId);
}
