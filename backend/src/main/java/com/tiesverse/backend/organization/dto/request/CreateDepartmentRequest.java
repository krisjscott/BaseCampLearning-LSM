package com.tiesverse.backend.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateDepartmentRequest {

    @NotBlank
    private String name;

    private String description;

    @NotNull
    private UUID organizationId;
}
