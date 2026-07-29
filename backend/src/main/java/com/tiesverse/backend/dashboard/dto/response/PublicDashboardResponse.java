package com.tiesverse.backend.dashboard.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PublicDashboardResponse {

    private List<ContinueLearningItem> continueLearning;
    private List<RecommendedCourseItem> recommendedCourses;
    private List<RecentActivityItem> recentActivities;

    @Data
    @Builder
    public static class ContinueLearningItem {
        private UUID courseId;
        private String courseTitle;
        private String thumbnailUrl;
        private Double completionPercentage;
        private LocalDateTime lastAccessedAt;
    }

    @Data
    @Builder
    public static class RecommendedCourseItem {
        private UUID courseId;
        private String courseTitle;
        private String thumbnailUrl;
        private String instructorName;
        private BigDecimal rating;
        private Integer totalEnrollments;
    }

    @Data
    @Builder
    public static class RecentActivityItem {
        private String activityType;
        private String description;
        private LocalDateTime activityDate;
    }
}
