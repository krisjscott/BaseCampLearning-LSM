package com.tiesverse.backend.enrollment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class CreateLearningPathRequest {

    @NotBlank
    private String name;

    private String description;

    private UUID organizationId;

    private List<UUID> courseIds;
}
