package com.tiesverse.backend.admin.dto.request;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
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
public class UpdateAdminCourseRequest {
    private String title;
    private String description;
    private String thumbnailUrl;
    private UUID categoryId;
    private UUID organizationId;
    private CourseVisibility visibility;
    private CourseStatus status;
    private Integer durationHours;
    @PositiveOrZero(message = "Price must be non-negative")
    private Double price;
}