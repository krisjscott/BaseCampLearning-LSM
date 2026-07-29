package com.tiesverse.backend.analytics.service;

import com.tiesverse.backend.analytics.dto.response.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface AnalyticsService {

    List<DailyActiveUsersResponse> getDailyActiveUsers(LocalDate from, LocalDate to);

    List<CourseCompletionReport> getCourseCompletionReport(UUID organizationId);

    List<QuizScoreReport> getQuizScoreReport(UUID courseId);

    List<OrganizationProgressReport> getOrganizationProgress(UUID organizationId);

    List<PopularCourseReport> getPopularCourses(Integer limit);

    AnalyticsDashboardResponse getAnalyticsDashboard(UUID organizationId);
}
