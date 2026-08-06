package com.tiesverse.backend.notes.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NoteResponse {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private UUID lessonId;
    private String lessonTitle;
    private String content;
    private Integer timestampSeconds;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
