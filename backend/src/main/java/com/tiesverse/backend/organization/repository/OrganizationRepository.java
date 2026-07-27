package com.tiesverse.backend.organization.repository;

import com.tiesverse.backend.organization.entity.Organization;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface OrganizationRepository extends JpaRepository<Organization, UUID> {

    Optional<Organization> findBySsoProvider(String ssoProvider);

    boolean existsByName(String name);
}
