package com.tiesverse.backend.bookmark.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateBookmarkRequest {

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    @NotNull(message = "Lesson ID is required")
    private UUID lessonId;
}
