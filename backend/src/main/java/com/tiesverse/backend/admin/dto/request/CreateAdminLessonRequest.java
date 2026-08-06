package com.tiesverse.backend.admin.dto.request;

import com.tiesverse.backend.common.enums.ContentType;
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
public class CreateAdminLessonRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private String contentUrl;

    @NotNull(message = "Content type is required")
    private ContentType contentType;

    @PositiveOrZero(message = "Duration must be non-negative")
    private Integer durationMinutes;

    @NotNull(message = "Order index is required")
    private Integer orderIndex;

    @NotNull(message = "Module ID is required")
    private UUID moduleId;
}