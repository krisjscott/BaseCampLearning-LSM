package com.tiesverse.backend.auth.repository;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.common.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByGoogleId(String googleId);

    Optional<Account> findByRefreshToken(String refreshToken);

    boolean existsByEmail(String email);

    Page<Account> findByRoleIn(List<Role> roles, Pageable pageable);

    Optional<Account> findByUserId(UUID userId);
}
