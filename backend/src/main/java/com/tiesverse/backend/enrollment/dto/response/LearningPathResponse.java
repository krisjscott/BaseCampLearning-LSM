package com.tiesverse.backend.enrollment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class LearningPathResponse {

    private UUID id;
    private String name;
    private String description;
    private List<UUID> courseIds;
}
