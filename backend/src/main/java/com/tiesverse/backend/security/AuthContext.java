package com.tiesverse.backend.security;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.common.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Set;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class AuthContext {

    private static final Set<Role> ADMIN_ROLES = Set.of(Role.HR_ADMIN, Role.ORGANIZATION_ADMIN, Role.SUPER_ADMIN);

    private final AccountRepository accountRepository;
    private final OrganizationScope organizationScope;

    public Account currentAccount(Principal principal) {
        if (principal == null || principal.getName() == null) {
            throw new UnauthorizedException("Authentication required");
        }
        return accountRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new UnauthorizedException("Account not found"));
    }

    public UUID currentUserId(Principal principal) {
        UUID userId = currentAccount(principal).getUserId();
        if (userId == null) {
            throw new UnauthorizedException("Account is not linked to a user profile");
        }
        return userId;
    }

    public boolean isAdmin(Account account) {
        return account != null && ADMIN_ROLES.contains(account.getRole());
    }

    public void requireSelfOrAdmin(Principal principal, UUID requestedUserId) {
        Account account = currentAccount(principal);
        UUID currentUserId = account.getUserId();
        if (currentUserId != null && currentUserId.equals(requestedUserId)) {
            return;
        }
        if (!isAdmin(account)) {
            throw new ForbiddenException("You can only access your own learner data");
        }
        organizationScope.requireSameOrganizationAsUser(account, requestedUserId);
    }
}
