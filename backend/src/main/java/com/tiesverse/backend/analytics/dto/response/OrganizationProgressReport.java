package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrganizationProgressReport {

    private UUID organizationId;
    private String organizationName;
    private Integer totalEmployees;
    private Integer activeEmployees;
    private Double averageCompletion;
}
