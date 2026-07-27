package com.tiesverse.backend.organization.repository;

import com.tiesverse.backend.organization.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TeamRepository extends JpaRepository<Team, UUID> {

    List<Team> findByDepartmentId(UUID departmentId);
}
