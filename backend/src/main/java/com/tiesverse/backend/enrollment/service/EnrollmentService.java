package com.tiesverse.backend.enrollment.service;

import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.enrollment.dto.request.AssignCourseRequest;
import com.tiesverse.backend.enrollment.dto.request.CreateLearningPathRequest;
import com.tiesverse.backend.enrollment.dto.request.EnrollRequest;
import com.tiesverse.backend.enrollment.dto.response.EnrollmentResponse;
import com.tiesverse.backend.enrollment.dto.response.LearningPathResponse;

import java.util.List;
import java.util.UUID;

public interface EnrollmentService {

    EnrollmentResponse enroll(EnrollRequest request);

    EnrollmentResponse assignCourse(AssignCourseRequest request);

    List<EnrollmentResponse> getEnrollmentsByUser(UUID userId);

    List<EnrollmentResponse> getEnrollmentsByCourse(UUID courseId);

    EnrollmentResponse updateStatus(UUID enrollmentId, EnrollmentStatus status);

    LearningPathResponse createLearningPath(CreateLearningPathRequest request);

    List<LearningPathResponse> getLearningPaths(UUID organizationId);
}
