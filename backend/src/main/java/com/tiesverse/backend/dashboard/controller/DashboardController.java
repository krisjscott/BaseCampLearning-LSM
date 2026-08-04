package com.tiesverse.backend.dashboard.controller;

import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.dashboard.dto.response.AdminDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.EmployeeDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.PublicDashboardResponse;
import com.tiesverse.backend.dashboard.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.UUID;
import com.tiesverse.backend.security.AuthContext;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;
    private final AccountRepository accountRepository;
    private final AuthContext authContext;

    @GetMapping("/public")
    public ApiResponse<PublicDashboardResponse> getPublicDashboard(Principal principal) {
        UUID userId = principal == null
                ? null
                : accountRepository.findByEmail(principal.getName())
                        .orElseThrow(() -> new RuntimeException("Account not found"))
                        .getUserId();
        return ApiResponse.success(dashboardService.getPublicDashboard(userId));
    }

    @GetMapping("/employee")
    public ApiResponse<EmployeeDashboardResponse> getEmployeeDashboard(Principal principal, @RequestParam UUID userId) {
        authContext.requireSelfOrAdmin(principal, userId);
        return ApiResponse.success(dashboardService.getEmployeeDashboard(userId));
    }

    @GetMapping("/admin")
    public ApiResponse<AdminDashboardResponse> getAdminDashboard(@RequestParam UUID organizationId) {
        return ApiResponse.success(dashboardService.getAdminDashboard(organizationId));
    }
}
