package com.tiesverse.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsResponse {
    private Long totalUsers;
    private Long totalCourses;
    private Long totalEnrollments;
    private Long activeEnrollments;
    private Long completedEnrollments;
    private Double completionRate;
    private BigDecimal totalRevenue;
    private Long totalAssessments;
    private Long totalCertificatesIssued;
    private Long pendingReviews;
}