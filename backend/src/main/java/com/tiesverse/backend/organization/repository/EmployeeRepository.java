package com.tiesverse.backend.organization.repository;

import com.tiesverse.backend.organization.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByUserIdAndOrganizationId(UUID userId, UUID organizationId);

    List<Employee> findByOrganizationId(UUID organizationId);

    List<Employee> findByDepartmentId(UUID departmentId);
}
