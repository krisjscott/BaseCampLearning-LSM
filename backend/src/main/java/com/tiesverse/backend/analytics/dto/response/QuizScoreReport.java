package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class QuizScoreReport {

    private UUID assessmentId;
    private String assessmentTitle;
    private Double averageScore;
    private Integer totalAttempts;
    private Integer passCount;
    private Integer failCount;
}
