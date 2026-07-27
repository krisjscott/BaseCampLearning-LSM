package com.tiesverse.backend.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateCategoryRequest {

    @NotBlank
    private String name;

    private String description;

    private UUID parentId;
}
