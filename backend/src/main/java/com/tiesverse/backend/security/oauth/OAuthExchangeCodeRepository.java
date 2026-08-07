package com.tiesverse.backend.security.oauth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;

import jakarta.persistence.LockModeType;

import java.util.Optional;
import java.util.UUID;

public interface OAuthExchangeCodeRepository extends JpaRepository<OAuthExchangeCode, UUID> {
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<OAuthExchangeCode> findByCodeHashAndUsedAtIsNull(String codeHash);
    void deleteByAccountIdAndUsedAtIsNull(UUID accountId);
}
