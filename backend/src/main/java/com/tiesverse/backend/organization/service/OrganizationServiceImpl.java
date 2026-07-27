package com.tiesverse.backend.organization.service;

import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
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
import com.tiesverse.backend.organization.entity.Department;
import com.tiesverse.backend.organization.entity.Employee;
import com.tiesverse.backend.organization.entity.Organization;
import com.tiesverse.backend.organization.entity.Team;
import com.tiesverse.backend.organization.mapper.OrganizationMapper;
import com.tiesverse.backend.organization.repository.DepartmentRepository;
import com.tiesverse.backend.organization.repository.EmployeeRepository;
import com.tiesverse.backend.organization.repository.OrganizationRepository;
import com.tiesverse.backend.organization.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final DepartmentRepository departmentRepository;
    private final TeamRepository teamRepository;
    private final EmployeeRepository employeeRepository;
    private final OrganizationMapper organizationMapper;

    @Override
    public OrganizationResponse createOrganization(CreateOrganizationRequest request) {
        if (organizationRepository.existsByName(request.getName())) {
            throw new ConflictException("Organization with name '" + request.getName() + "' already exists");
        }
        Organization organization = organizationMapper.toEntity(request);
        organization.setActive(true);
        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponse getOrganization(UUID id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
        return organizationMapper.toResponse(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizationResponse> getAllOrganizations() {
        return organizationRepository.findAll().stream()
                .map(organizationMapper::toResponse)
                .toList();
    }

    @Override
    public OrganizationResponse updateOrganization(UUID id, UpdateOrganizationRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
        if (request.getName() != null && !request.getName().equals(organization.getName())
                && organizationRepository.existsByName(request.getName())) {
            throw new ConflictException("Organization with name '" + request.getName() + "' already exists");
        }
        organizationMapper.updateEntity(request, organization);
        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    public void deleteOrganization(UUID id) {
        if (!organizationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Organization", "id", id);
        }
        organizationRepository.deleteById(id);
    }

    @Override
    public OrganizationResponse configureSSO(UUID id, SSOConfigRequest request) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", "id", id));
        organization.setSsoProvider(request.getSsoProvider());
        organization.setSsoClientId(request.getSsoClientId());
        organization.setSsoClientSecret(request.getSsoClientSecret());
        return organizationMapper.toResponse(organizationRepository.save(organization));
    }

    @Override
    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            throw new ResourceNotFoundException("Organization", "id", request.getOrganizationId());
        }
        Department department = organizationMapper.toEntity(request);
        return organizationMapper.toDepartmentResponse(departmentRepository.save(department));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DepartmentResponse> getDepartments(UUID organizationId) {
        return departmentRepository.findByOrganizationId(organizationId).stream()
                .map(organizationMapper::toDepartmentResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DepartmentResponse getDepartment(UUID id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return organizationMapper.toDepartmentResponse(department);
    }

    @Override
    public DepartmentResponse updateDepartment(UUID id, CreateDepartmentRequest request) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        department.setName(request.getName());
        department.setDescription(request.getDescription());
        return organizationMapper.toDepartmentResponse(departmentRepository.save(department));
    }

    @Override
    public void deleteDepartment(UUID id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department", "id", id);
        }
        departmentRepository.deleteById(id);
    }

    @Override
    public TeamResponse createTeam(CreateTeamRequest request) {
        if (!departmentRepository.existsById(request.getDepartmentId())) {
            throw new ResourceNotFoundException("Department", "id", request.getDepartmentId());
        }
        Team team = organizationMapper.toEntity(request);
        return organizationMapper.toTeamResponse(teamRepository.save(team));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TeamResponse> getTeams(UUID departmentId) {
        return teamRepository.findByDepartmentId(departmentId).stream()
                .map(organizationMapper::toTeamResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TeamResponse getTeam(UUID id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", id));
        return organizationMapper.toTeamResponse(team);
    }

    @Override
    public TeamResponse updateTeam(UUID id, CreateTeamRequest request) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", id));
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        return organizationMapper.toTeamResponse(teamRepository.save(team));
    }

    @Override
    public void deleteTeam(UUID id) {
        if (!teamRepository.existsById(id)) {
            throw new ResourceNotFoundException("Team", "id", id);
        }
        teamRepository.deleteById(id);
    }

    @Override
    public EmployeeResponse addEmployee(AddEmployeeRequest request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            throw new ResourceNotFoundException("Organization", "id", request.getOrganizationId());
        }
        employeeRepository.findByUserIdAndOrganizationId(request.getUserId(), request.getOrganizationId())
                .ifPresent(e -> {
                    throw new ConflictException("Employee already exists in this organization");
                });
        Employee employee = organizationMapper.toEntity(request);
        employee.setHireDate(LocalDate.now());
        employee.setActive(true);
        return organizationMapper.toEmployeeResponse(employeeRepository.save(employee));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmployeeResponse> getEmployees(UUID organizationId) {
        return employeeRepository.findByOrganizationId(organizationId).stream()
                .map(organizationMapper::toEmployeeResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        return organizationMapper.toEmployeeResponse(employee);
    }

    @Override
    public void removeEmployee(UUID id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee", "id", id));
        employee.setActive(false);
        employeeRepository.save(employee);
    }
}
