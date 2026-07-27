package com.tiesverse.backend.analytics.controller;

import com.tiesverse.backend.analytics.dto.response.*;
import com.tiesverse.backend.analytics.service.AnalyticsService;
import com.tiesverse.backend.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/daily-active-users")
    public ApiResponse<List<DailyActiveUsersResponse>> getDailyActiveUsers(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ApiResponse.success(analyticsService.getDailyActiveUsers(from, to));
    }

    @GetMapping("/course-completion")
    public ApiResponse<List<CourseCompletionReport>> getCourseCompletionReport(@RequestParam UUID organizationId) {
        return ApiResponse.success(analyticsService.getCourseCompletionReport(organizationId));
    }

    @GetMapping("/quiz-scores")
    public ApiResponse<List<QuizScoreReport>> getQuizScoreReport(@RequestParam UUID courseId) {
        return ApiResponse.success(analyticsService.getQuizScoreReport(courseId));
    }

    @GetMapping("/organization-progress")
    public ApiResponse<List<OrganizationProgressReport>> getOrganizationProgress(@RequestParam UUID organizationId) {
        return ApiResponse.success(analyticsService.getOrganizationProgress(organizationId));
    }

    @GetMapping("/popular-courses")
    public ApiResponse<List<PopularCourseReport>> getPopularCourses(@RequestParam(defaultValue = "10") Integer limit) {
        return ApiResponse.success(analyticsService.getPopularCourses(limit));
    }

    @GetMapping("/dashboard")
    public ApiResponse<AnalyticsDashboardResponse> getAnalyticsDashboard(@RequestParam UUID organizationId) {
        return ApiResponse.success(analyticsService.getAnalyticsDashboard(organizationId));
    }
}
