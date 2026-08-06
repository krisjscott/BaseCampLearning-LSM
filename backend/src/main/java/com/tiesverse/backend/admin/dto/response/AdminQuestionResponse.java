package com.tiesverse.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuestionResponse {
    private String id;
    private String questionText;
    private String questionType;
    private Integer points;
    private Integer orderIndex;
    private String assessmentId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<AdminQuestionOptionResponse> options;
}