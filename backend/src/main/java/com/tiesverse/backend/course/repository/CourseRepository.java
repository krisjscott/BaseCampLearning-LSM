package com.tiesverse.backend.course.repository;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.course.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByVisibilityAndStatus(CourseVisibility visibility, CourseStatus status);

    List<Course> findByInstructorId(UUID instructorId);

    List<Course> findByOrganizationId(UUID organizationId);

    List<Course> findByCategoryId(UUID categoryId);

    Page<Course> findByTitleContainingIgnoreCase(String title, Pageable pageable);
}
