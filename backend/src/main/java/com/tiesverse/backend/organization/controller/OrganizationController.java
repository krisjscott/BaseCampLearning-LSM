package com.tiesverse.backend.organization.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.organization.dto.request.AddEmployeeRequest;
import com.tiesverse.backend.organization.dto.request.CreateDepartmentRequest;
import com.tiesverse.backend.organization.dto.request.CreateOrganizationRequest;
import com.tiesverse.backend.organization.dto.request.CreateTeamRequest;
import com.tiesverse.backend.organization.dto.request.SSOConfigRequest;
import com.tiesverse.backend.organization.dto.request.UpdateOrganizationRequest;
import com.tiesverse.backend.organization.dto.response.DepartmentResponse;
import com.tiesverse.backend.organization.dto.response.EmployeeResponse;
import com.tiesverse.backend.organization.dto.response.OrganizationResponse;
import com.tiesverse.backend.organization.dto.response.TeamResponse;
import com.tiesverse.backend.organization.service.OrganizationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService organizationService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<OrganizationResponse> createOrganization(@Valid @RequestBody CreateOrganizationRequest request) {
        return ApiResponse.success("Organization created", organizationService.createOrganization(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<OrganizationResponse> getOrganization(@PathVariable UUID id) {
        return ApiResponse.success(organizationService.getOrganization(id));
    }

    @GetMapping
    public ApiResponse<List<OrganizationResponse>> getAllOrganizations() {
        return ApiResponse.success(organizationService.getAllOrganizations());
    }

    @PutMapping("/{id}")
    public ApiResponse<OrganizationResponse> updateOrganization(@PathVariable UUID id,
                                                                @Valid @RequestBody UpdateOrganizationRequest request) {
        return ApiResponse.success("Organization updated", organizationService.updateOrganization(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteOrganization(@PathVariable UUID id) {
        organizationService.deleteOrganization(id);
        return ApiResponse.success("Organization deleted", null);
    }

    @PutMapping("/{id}/sso")
    public ApiResponse<OrganizationResponse> configureSSO(@PathVariable UUID id,
                                                          @Valid @RequestBody SSOConfigRequest request) {
        return ApiResponse.success("SSO configured", organizationService.configureSSO(id, request));
    }

    @PostMapping("/departments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<DepartmentResponse> createDepartment(@Valid @RequestBody CreateDepartmentRequest request) {
        return ApiResponse.success("Department created", organizationService.createDepartment(request));
    }

    @GetMapping("/{organizationId}/departments")
    public ApiResponse<List<DepartmentResponse>> getDepartments(@PathVariable UUID organizationId) {
        return ApiResponse.success(organizationService.getDepartments(organizationId));
    }

    @GetMapping("/departments/{id}")
    public ApiResponse<DepartmentResponse> getDepartment(@PathVariable UUID id) {
        return ApiResponse.success(organizationService.getDepartment(id));
    }

    @PutMapping("/departments/{id}")
    public ApiResponse<DepartmentResponse> updateDepartment(@PathVariable UUID id,
                                                            @Valid @RequestBody CreateDepartmentRequest request) {
        return ApiResponse.success("Department updated", organizationService.updateDepartment(id, request));
    }

    @DeleteMapping("/departments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteDepartment(@PathVariable UUID id) {
        organizationService.deleteDepartment(id);
        return ApiResponse.success("Department deleted", null);
    }

    @PostMapping("/teams")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TeamResponse> createTeam(@Valid @RequestBody CreateTeamRequest request) {
        return ApiResponse.success("Team created", organizationService.createTeam(request));
    }

    @GetMapping("/departments/{departmentId}/teams")
    public ApiResponse<List<TeamResponse>> getTeams(@PathVariable UUID departmentId) {
        return ApiResponse.success(organizationService.getTeams(departmentId));
    }

    @GetMapping("/teams/{id}")
    public ApiResponse<TeamResponse> getTeam(@PathVariable UUID id) {
        return ApiResponse.success(organizationService.getTeam(id));
    }

    @PutMapping("/teams/{id}")
    public ApiResponse<TeamResponse> updateTeam(@PathVariable UUID id,
                                                @Valid @RequestBody CreateTeamRequest request) {
        return ApiResponse.success("Team updated", organizationService.updateTeam(id, request));
    }

    @DeleteMapping("/teams/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteTeam(@PathVariable UUID id) {
        organizationService.deleteTeam(id);
        return ApiResponse.success("Team deleted", null);
    }

    @PostMapping("/employees")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EmployeeResponse> addEmployee(@Valid @RequestBody AddEmployeeRequest request) {
        return ApiResponse.success("Employee added", organizationService.addEmployee(request));
    }

    @GetMapping("/{organizationId}/employees")
    public ApiResponse<List<EmployeeResponse>> getEmployees(@PathVariable UUID organizationId) {
        return ApiResponse.success(organizationService.getEmployees(organizationId));
    }

    @GetMapping("/employees/{id}")
    public ApiResponse<EmployeeResponse> getEmployee(@PathVariable UUID id) {
        return ApiResponse.success(organizationService.getEmployee(id));
    }

    @DeleteMapping("/employees/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> removeEmployee(@PathVariable UUID id) {
        organizationService.removeEmployee(id);
        return ApiResponse.success("Employee removed", null);
    }
}
