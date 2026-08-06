package com.tiesverse.backend.course.repository;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.course.entity.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface CourseRepository extends JpaRepository<Course, UUID> {

    List<Course> findByVisibilityAndStatus(CourseVisibility visibility, CourseStatus status);

    List<Course> findByInstructorId(UUID instructorId);

    List<Course> findByOrganizationId(UUID organizationId);

    List<Course> findByCategoryId(UUID categoryId);

    Page<Course> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    long countByStatus(CourseStatus status);

    @Query("SELECT c FROM Course c WHERE " +
            "(:search = '' OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:visibility IS NULL OR c.visibility = :visibility)")
    Page<Course> findAdminCourses(@Param("search") String search,
                                    @Param("status") CourseStatus status,
                                    @Param("visibility") CourseVisibility visibility,
                                    Pageable pageable);

    @Query("SELECT COALESCE(SUM(c.price * c.totalEnrollments), 0) FROM Course c " +
            "WHERE c.price IS NOT NULL AND c.totalEnrollments IS NOT NULL")
    Double sumRevenue();
}
