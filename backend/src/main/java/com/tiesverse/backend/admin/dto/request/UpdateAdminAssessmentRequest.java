package com.tiesverse.backend.admin.dto.request;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAdminAssessmentRequest {
    private String title;
    private String description;
    private String assessmentType;
    @PositiveOrZero(message = "Passing score must be non-negative")
    private Integer passingScore;
    @PositiveOrZero(message = "Time limit must be non-negative")
    private Integer timeLimitMinutes;
    @PositiveOrZero(message = "Max attempts must be non-negative")
    private Integer maxAttempts;
    private List<CreateAdminQuestionRequest> questions;
}