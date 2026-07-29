package com.tiesverse.backend.auth.repository;

import com.tiesverse.backend.auth.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByEmail(String email);

    Optional<Account> findByGoogleId(String googleId);

    Optional<Account> findByRefreshToken(String refreshToken);

    boolean existsByEmail(String email);
}
