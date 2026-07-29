package com.tiesverse.backend.organization.service;

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

import java.util.List;
import java.util.UUID;

public interface OrganizationService {

    OrganizationResponse createOrganization(CreateOrganizationRequest request);

    OrganizationResponse getOrganization(UUID id);

    List<OrganizationResponse> getAllOrganizations();

    OrganizationResponse updateOrganization(UUID id, UpdateOrganizationRequest request);

    void deleteOrganization(UUID id);

    OrganizationResponse configureSSO(UUID id, SSOConfigRequest request);

    DepartmentResponse createDepartment(CreateDepartmentRequest request);

    List<DepartmentResponse> getDepartments(UUID organizationId);

    DepartmentResponse getDepartment(UUID id);

    DepartmentResponse updateDepartment(UUID id, CreateDepartmentRequest request);

    void deleteDepartment(UUID id);

    TeamResponse createTeam(CreateTeamRequest request);

    List<TeamResponse> getTeams(UUID departmentId);

    TeamResponse getTeam(UUID id);

    TeamResponse updateTeam(UUID id, CreateTeamRequest request);

    void deleteTeam(UUID id);

    EmployeeResponse addEmployee(AddEmployeeRequest request);

    List<EmployeeResponse> getEmployees(UUID organizationId);

    EmployeeResponse getEmployee(UUID id);

    void removeEmployee(UUID id);
}
