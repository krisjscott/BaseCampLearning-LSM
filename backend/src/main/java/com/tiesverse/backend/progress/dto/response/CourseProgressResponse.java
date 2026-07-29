package com.tiesverse.backend.progress.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class CourseProgressResponse {

    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private UUID lastLessonId;
    private String lastLessonTitle;
    private Double completionPercentage;
    private Integer timeSpentMinutes;
    private LocalDateTime lastAccessedAt;
}
