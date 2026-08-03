package com.tiesverse.backend.assessment.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SubmitAssessmentRequest {

    @NotNull
    private UUID assessmentId;

    @Valid
    @NotEmpty
    private List<SubmitAnswerRequest> answers;
}
