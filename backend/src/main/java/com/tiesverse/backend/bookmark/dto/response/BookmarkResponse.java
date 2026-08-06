package com.tiesverse.backend.bookmark.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class BookmarkResponse {
    private UUID id;
    private UUID courseId;
    private String courseTitle;
    private UUID lessonId;
    private String lessonTitle;
    private LocalDateTime createdAt;
}
