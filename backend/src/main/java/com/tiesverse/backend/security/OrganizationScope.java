package com.tiesverse.backend.security;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.organization.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Central org-tenancy gate for admin-tier access to another user's data. An admin account
 * with no {@code organizationId} assigned is treated as unrestricted - this deployment
 * currently has no organizations/admin assignments, so that keeps today's behavior
 * unchanged for every existing account. Assigning an organization to an admin (via
 * {@code CreateAdminAccountRequest.organizationId}) is what turns this scoping on for
 * that admin going forward.
 */
@Component
@RequiredArgsConstructor
public class OrganizationScope {

    private final EmployeeRepository employeeRepository;

    public boolean isUnrestricted(Account admin) {
        return admin == null || admin.getRole() == Role.SUPER_ADMIN || admin.getOrganizationId() == null;
    }

    /** For resources that carry their own organizationId directly (e.g. Course). */
    public void requireSameOrganization(Account admin, UUID resourceOrganizationId) {
        if (isUnrestricted(admin)) {
            return;
        }
        if (resourceOrganizationId == null || !resourceOrganizationId.equals(admin.getOrganizationId())) {
            throw new ForbiddenException("This resource belongs to a different organization");
        }
    }

    /** For resources identified by the target learner's userId, via the Employee roster. */
    public void requireSameOrganizationAsUser(Account admin, UUID targetUserId) {
        if (isUnrestricted(admin)) {
            return;
        }
        boolean sameOrg = targetUserId != null
                && employeeRepository.findByUserIdAndOrganizationId(targetUserId, admin.getOrganizationId()).isPresent();
        if (!sameOrg) {
            throw new ForbiddenException("This learner is not in your organization");
        }
    }
}
