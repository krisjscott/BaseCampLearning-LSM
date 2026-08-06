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
public class AdminReadingContentResponse {
    private String id;
    private String title;
    private String contentHtml;
    private String contentMarkdown;
    private Integer estimatedReadingMinutes;
    private String lessonId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}