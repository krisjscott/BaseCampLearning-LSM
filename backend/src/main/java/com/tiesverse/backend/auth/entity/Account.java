package com.tiesverse.backend.auth.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.Role;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Account extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider authProvider;

    @Column(name = "google_id")
    private String googleId;

    @Column(name = "sso_provider_id")
    private String ssoProviderId;

    @Column(name = "email_verified")
    private boolean emailVerified;

    @Column(name = "refresh_token")
    private String refreshToken;

    @Column(name = "user_id")
    private UUID userId;

    // Scopes an HR_ADMIN/ORGANIZATION_ADMIN account's data access to a single
    // organization. Null means unrestricted (SUPER_ADMIN always is; any other admin with
    // no organization assigned keeps today's platform-wide access - see OrganizationScope).
    @Column(name = "organization_id")
    private UUID organizationId;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;
}
