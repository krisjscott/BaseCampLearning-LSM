package com.tiesverse.backend.dashboard.service;

import com.tiesverse.backend.dashboard.dto.response.AdminDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.EmployeeDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.PublicDashboardResponse;

import java.util.UUID;

public interface DashboardService {

    PublicDashboardResponse getPublicDashboard(UUID userId);

    EmployeeDashboardResponse getEmployeeDashboard(UUID userId);

    AdminDashboardResponse getAdminDashboard(UUID organizationId);
}
