package com.tiesverse.backend.enrollment.controller;

import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.enrollment.dto.request.AssignCourseRequest;
import com.tiesverse.backend.enrollment.dto.request.CreateLearningPathRequest;
import com.tiesverse.backend.enrollment.dto.request.EnrollRequest;
import com.tiesverse.backend.enrollment.dto.response.EnrollmentResponse;
import com.tiesverse.backend.enrollment.dto.response.LearningPathResponse;
import com.tiesverse.backend.enrollment.service.EnrollmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping
    public ApiResponse<EnrollmentResponse> enroll(@Valid @RequestBody EnrollRequest request) {
        return ApiResponse.success("Enrolled successfully", enrollmentService.enroll(request));
    }

    @PostMapping("/assign")
    public ApiResponse<EnrollmentResponse> assignCourse(@Valid @RequestBody AssignCourseRequest request) {
        return ApiResponse.success("Course assigned successfully", enrollmentService.assignCourse(request));
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<EnrollmentResponse>> getEnrollmentsByUser(@PathVariable UUID userId) {
        return ApiResponse.success(enrollmentService.getEnrollmentsByUser(userId));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<EnrollmentResponse>> getEnrollmentsByCourse(@PathVariable UUID courseId) {
        return ApiResponse.success(enrollmentService.getEnrollmentsByCourse(courseId));
    }

    @PutMapping("/{enrollmentId}/status")
    public ApiResponse<EnrollmentResponse> updateStatus(
            @PathVariable UUID enrollmentId,
            @RequestParam EnrollmentStatus status) {
        return ApiResponse.success("Status updated successfully", enrollmentService.updateStatus(enrollmentId, status));
    }

    @PostMapping("/learning-paths")
    public ApiResponse<LearningPathResponse> createLearningPath(@Valid @RequestBody CreateLearningPathRequest request) {
        return ApiResponse.success("Learning path created", enrollmentService.createLearningPath(request));
    }

    @GetMapping("/learning-paths")
    public ApiResponse<List<LearningPathResponse>> getLearningPaths(@RequestParam UUID organizationId) {
        return ApiResponse.success(enrollmentService.getLearningPaths(organizationId));
    }
}
