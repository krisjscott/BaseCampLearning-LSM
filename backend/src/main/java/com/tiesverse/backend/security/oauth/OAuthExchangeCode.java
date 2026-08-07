package com.tiesverse.backend.security.oauth;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "oauth_exchange_codes")
@Getter
@Setter
@NoArgsConstructor
public class OAuthExchangeCode extends BaseEntity {
    @Column(name = "account_id", nullable = false)
    private UUID accountId;

    @Column(name = "code_hash", nullable = false, unique = true, length = 64)
    private String codeHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used_at")
    private LocalDateTime usedAt;

    @Column(name = "new_user", nullable = false)
    private boolean newUser;
}
