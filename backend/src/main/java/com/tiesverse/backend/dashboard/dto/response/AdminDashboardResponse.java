package com.tiesverse.backend.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AdminDashboardResponse {

    private Integer activeEmployees;
    private Integer totalCourses;
    private Double averageCompletionRate;
    private List<AnalyticsSummary> analytics;
    private List<PendingAssignment> pendingAssignments;

    @Data
    @Builder
    public static class AnalyticsSummary {
        private String metric;
        private Object value;
    }

    @Data
    @Builder
    public static class PendingAssignment {
        private UUID courseId;
        private String courseTitle;
        private Integer pendingCount;
    }
}
