package com.tiesverse.backend.admin.dto.request;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAdminCourseRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String thumbnailUrl;

    @NotNull(message = "Category ID is required")
    private UUID categoryId;

    private UUID organizationId;

    @NotNull(message = "Visibility is required")
    private CourseVisibility visibility;

    @NotNull(message = "Status is required")
    private CourseStatus status;

    private Integer durationHours;

    @PositiveOrZero(message = "Price must be non-negative")
    private Double price;
}