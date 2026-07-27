package com.tiesverse.backend.progress.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.progress.dto.request.UpdateProgressRequest;
import com.tiesverse.backend.progress.dto.response.CourseProgressResponse;
import com.tiesverse.backend.progress.dto.response.LessonProgressResponse;
import com.tiesverse.backend.progress.service.ProgressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final ProgressService progressService;

    @GetMapping("/course/{courseId}/user/{userId}")
    public ApiResponse<CourseProgressResponse> getCourseProgress(
            @PathVariable UUID courseId,
            @PathVariable UUID userId) {
        return ApiResponse.success(progressService.getCourseProgress(userId, courseId));
    }

    @PutMapping("/course/{courseId}/user/{userId}")
    public ApiResponse<CourseProgressResponse> updateLessonProgress(
            @PathVariable UUID courseId,
            @PathVariable UUID userId,
            @Valid @RequestBody UpdateProgressRequest request) {
        return ApiResponse.success("Progress updated", progressService.updateLessonProgress(userId, courseId, request));
    }

    @GetMapping("/course/{courseId}/user/{userId}/resume")
    public ApiResponse<CourseProgressResponse> getResumePoint(
            @PathVariable UUID courseId,
            @PathVariable UUID userId) {
        return ApiResponse.success(progressService.getResumePoint(userId, courseId));
    }

    @GetMapping("/lessons/user/{userId}")
    public ApiResponse<List<LessonProgressResponse>> getLessonProgress(
            @PathVariable UUID userId,
            @RequestParam List<UUID> lessonIds) {
        return ApiResponse.success(progressService.getLessonProgress(userId, lessonIds));
    }
}
