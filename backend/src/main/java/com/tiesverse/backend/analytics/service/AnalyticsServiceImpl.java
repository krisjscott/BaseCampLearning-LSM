package com.tiesverse.backend.analytics.service;

import com.tiesverse.backend.analytics.dto.response.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    @Override
    public List<DailyActiveUsersResponse> getDailyActiveUsers(LocalDate from, LocalDate to) {
        return List.of();
    }

    @Override
    public List<CourseCompletionReport> getCourseCompletionReport(UUID organizationId) {
        return List.of();
    }

    @Override
    public List<QuizScoreReport> getQuizScoreReport(UUID courseId) {
        return List.of();
    }

    @Override
    public List<OrganizationProgressReport> getOrganizationProgress(UUID organizationId) {
        return List.of();
    }

    @Override
    public List<PopularCourseReport> getPopularCourses(Integer limit) {
        return List.of();
    }

    @Override
    public AnalyticsDashboardResponse getAnalyticsDashboard(UUID organizationId) {
        return AnalyticsDashboardResponse.builder()
                .dailyActiveUsers(List.of())
                .courseCompletions(List.of())
                .quizScores(List.of())
                .organizationProgress(List.of())
                .popularCourses(List.of())
                .build();
    }
}
