package com.tiesverse.backend.progress.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

import java.util.UUID;

@Data
public class UpdateProgressRequest {

    @NotNull
    private UUID lessonId;

    private boolean completed;

    @PositiveOrZero
    @Max(1440)
    private Integer timeSpentMinutes;
}
