package com.tiesverse.backend.dashboard.service;

import com.tiesverse.backend.dashboard.dto.response.AdminDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.EmployeeDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.PublicDashboardResponse;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Override
    @Cacheable(value = "publicDashboard", key = "#userId")
    public PublicDashboardResponse getPublicDashboard(UUID userId) {
        return PublicDashboardResponse.builder()
                .continueLearning(List.of())
                .recommendedCourses(List.of())
                .recentActivities(List.of())
                .build();
    }

    @Override
    @Cacheable(value = "employeeDashboard", key = "#userId")
    public EmployeeDashboardResponse getEmployeeDashboard(UUID userId) {
        return EmployeeDashboardResponse.builder()
                .assignedModules(List.of())
                .complianceTraining(List.of())
                .teamProgress(EmployeeDashboardResponse.TeamProgressItem.builder().build())
                .internalCertifications(List.of())
                .build();
    }

    @Override
    @Cacheable(value = "adminDashboard", key = "#organizationId")
    public AdminDashboardResponse getAdminDashboard(UUID organizationId) {
        return AdminDashboardResponse.builder()
                .activeEmployees(0)
                .totalCourses(0)
                .averageCompletionRate(0.0)
                .analytics(List.of())
                .pendingAssignments(List.of())
                .build();
    }
}
