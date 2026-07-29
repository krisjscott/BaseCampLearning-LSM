package com.tiesverse.backend.assessment.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class QuestionResponse {

    private UUID id;
    private String questionText;
    private String questionType;
    private Integer points;
    private Integer orderIndex;
    private List<OptionResponse> options;
}
