package com.tiesverse.backend.admin.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminQuestionOptionResponse {
    private String id;
    private String optionText;
    private Boolean correct;
    private Integer orderIndex;
    private LocalDateTime createdAt;
}