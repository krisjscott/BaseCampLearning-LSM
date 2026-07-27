package com.tiesverse.backend.course.repository;

import com.tiesverse.backend.course.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseModuleRepository extends JpaRepository<CourseModule, UUID> {

    List<CourseModule> findByCourseIdOrderByOrderIndex(UUID courseId);
}
