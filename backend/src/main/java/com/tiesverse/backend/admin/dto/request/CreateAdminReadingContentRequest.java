package com.tiesverse.backend.admin.dto.request;

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
public class CreateAdminReadingContentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Content HTML is required")
    private String contentHtml;

    private String contentMarkdown;

    @PositiveOrZero(message = "Estimated reading minutes must be non-negative")
    private Integer estimatedReadingMinutes;

    @NotNull(message = "Lesson ID is required")
    private UUID lessonId;
}