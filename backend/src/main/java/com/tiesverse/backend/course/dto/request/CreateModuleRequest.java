package com.tiesverse.backend.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateModuleRequest {

    @NotBlank
    private String title;

    private String description;

    private Integer orderIndex;

    @NotNull
    private UUID courseId;
}
