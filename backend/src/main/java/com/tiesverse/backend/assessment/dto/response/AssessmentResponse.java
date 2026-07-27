package com.tiesverse.backend.assessment.dto.response;

import com.tiesverse.backend.common.enums.AssessmentType;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class AssessmentResponse {

    private UUID id;
    private String title;
    private String description;
    private UUID courseId;
    private AssessmentType type;
    private Integer passingScore;
    private Integer timeLimitMinutes;
    private Integer maxAttempts;
    private List<QuestionResponse> questions;
}
