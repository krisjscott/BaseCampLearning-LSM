package com.tiesverse.backend.assessment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssessmentResultResponse {

    private UUID id;
    private UUID assessmentId;
    private String assessmentTitle;
    private Integer score;
    private Integer attemptNumber;
    private boolean passed;
    private LocalDateTime submittedAt;
}
