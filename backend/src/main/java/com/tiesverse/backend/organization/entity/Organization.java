package com.tiesverse.backend.organization.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "organizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Organization extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String name;

    private String description;

    @Column(name = "logo_url")
    private String logoUrl;

    private String website;

    @Column(name = "sso_provider")
    private String ssoProvider;

    @Column(name = "sso_client_id")
    private String ssoClientId;

    @Column(name = "sso_client_secret")
    private String ssoClientSecret;

    private boolean active;
}
