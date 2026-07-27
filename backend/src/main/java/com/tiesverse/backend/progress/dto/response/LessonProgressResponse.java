package com.tiesverse.backend.progress.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LessonProgressResponse {

    private UUID id;
    private UUID lessonId;
    private String lessonTitle;
    private boolean completed;
    private Integer timeSpentMinutes;
    private LocalDateTime completedAt;
}
