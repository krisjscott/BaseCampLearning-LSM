package com.tiesverse.backend.assessment.dto.request;

import com.tiesverse.backend.common.enums.AssessmentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateAssessmentRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private UUID courseId;

    private AssessmentType type;

    private Integer passingScore;

    private Integer timeLimitMinutes;

    private Integer maxAttempts;
}
