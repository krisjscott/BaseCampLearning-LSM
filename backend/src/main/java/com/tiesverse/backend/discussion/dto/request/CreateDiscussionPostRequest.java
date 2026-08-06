package com.tiesverse.backend.discussion.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateDiscussionPostRequest {

    @NotNull(message = "Course ID is required")
    private UUID courseId;

    private UUID parentId;

    @NotBlank(message = "Content is required")
    private String content;
}
