package com.tiesverse.backend.assessment.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;

@Data
public class CreateQuestionRequest {

    @NotBlank
    private String questionText;

    private String questionType;

    private Integer points;

    private Integer orderIndex;

    private List<CreateOptionRequest> options;
}
