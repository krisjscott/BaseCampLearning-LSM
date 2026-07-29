package com.tiesverse.backend.progress.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateProgressRequest {

    @NotNull
    private UUID lessonId;

    private boolean completed;

    private Integer timeSpentMinutes;
}
