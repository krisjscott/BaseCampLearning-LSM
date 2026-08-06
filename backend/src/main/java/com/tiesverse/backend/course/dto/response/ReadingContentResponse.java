package com.tiesverse.backend.course.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class ReadingContentResponse {
    private UUID id;
    private String title;
    private String contentHtml;
    private String contentMarkdown;
    private Integer estimatedReadingMinutes;
    private UUID lessonId;
}
