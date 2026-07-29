package com.tiesverse.backend.organization.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class AddEmployeeRequest {

    @NotNull
    private UUID userId;

    @NotNull
    private UUID organizationId;

    private UUID departmentId;

    private UUID teamId;

    private String employeeCode;

    private String jobTitle;
}
