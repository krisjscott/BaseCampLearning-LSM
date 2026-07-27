package com.tiesverse.backend.organization.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DepartmentResponse {

    private UUID id;

    private String name;

    private String description;

    private UUID organizationId;
}
