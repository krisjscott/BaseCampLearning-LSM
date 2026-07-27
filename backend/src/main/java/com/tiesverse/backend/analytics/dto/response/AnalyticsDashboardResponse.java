package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class AnalyticsDashboardResponse {

    private List<DailyActiveUsersResponse> dailyActiveUsers;
    private List<CourseCompletionReport> courseCompletions;
    private List<QuizScoreReport> quizScores;
    private List<OrganizationProgressReport> organizationProgress;
    private List<PopularCourseReport> popularCourses;
}
