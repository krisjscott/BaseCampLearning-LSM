package com.tiesverse.backend.organization.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TeamResponse {

    private UUID id;

    private String name;

    private String description;

    private UUID departmentId;
}
