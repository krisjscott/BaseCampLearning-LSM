package com.tiesverse.backend.organization.mapper;

import com.tiesverse.backend.organization.dto.request.AddEmployeeRequest;
import com.tiesverse.backend.organization.dto.request.CreateDepartmentRequest;
import com.tiesverse.backend.organization.dto.request.CreateOrganizationRequest;
import com.tiesverse.backend.organization.dto.request.CreateTeamRequest;
import com.tiesverse.backend.organization.dto.request.UpdateOrganizationRequest;
import com.tiesverse.backend.organization.dto.response.DepartmentResponse;
import com.tiesverse.backend.organization.dto.response.EmployeeResponse;
import com.tiesverse.backend.organization.dto.response.OrganizationResponse;
import com.tiesverse.backend.organization.dto.response.TeamResponse;
import com.tiesverse.backend.organization.entity.Department;
import com.tiesverse.backend.organization.entity.Employee;
import com.tiesverse.backend.organization.entity.Organization;
import com.tiesverse.backend.organization.entity.Team;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring")
public interface OrganizationMapper {

    Organization toEntity(CreateOrganizationRequest request);

    OrganizationResponse toResponse(Organization entity);

    Department toEntity(CreateDepartmentRequest request);

    DepartmentResponse toDepartmentResponse(Department entity);

    Team toEntity(CreateTeamRequest request);

    TeamResponse toTeamResponse(Team entity);

    Employee toEntity(AddEmployeeRequest request);

    EmployeeResponse toEmployeeResponse(Employee entity);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(UpdateOrganizationRequest request, @MappingTarget Organization entity);
}
