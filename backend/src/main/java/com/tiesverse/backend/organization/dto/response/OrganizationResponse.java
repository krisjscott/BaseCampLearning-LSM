package com.tiesverse.backend.organization.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class OrganizationResponse {

    private UUID id;

    private String name;

    private String description;

    private String logoUrl;

    private String website;

    private boolean active;

    private LocalDateTime createdAt;
}
