package com.tiesverse.backend.organization.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrganizationRequest {

    @NotBlank
    private String name;

    private String description;

    private String website;
}
