package com.tiesverse.backend.organization.dto.request;

import lombok.Data;

@Data
public class UpdateOrganizationRequest {

    private String name;

    private String description;

    private String website;

    private String logoUrl;
}
