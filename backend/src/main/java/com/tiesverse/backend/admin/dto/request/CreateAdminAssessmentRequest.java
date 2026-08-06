package com.tiesverse.backend.admin.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAdminAssessmentRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    @NotNull(message = "Assessment type is required")
    private String assessmentType;

    @PositiveOrZero(message = "Passing score must be non-negative")
    private Integer passingScore;

    @PositiveOrZero(message = "Time limit must be non-negative")
    private Integer timeLimitMinutes;

    @PositiveOrZero(message = "Max attempts must be non-negative")
    private Integer maxAttempts;

    private List<CreateAdminQuestionRequest> questions;
}