package com.tiesverse.backend.course.dto.request;

import com.tiesverse.backend.common.enums.CourseVisibility;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateCourseRequest {

    @NotBlank
    private String title;

    private String description;

    private String thumbnailUrl;

    private UUID categoryId;

    private UUID organizationId;

    private CourseVisibility visibility;

    private Integer durationHours;

    private Double price;
}
