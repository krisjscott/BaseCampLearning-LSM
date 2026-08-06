package com.tiesverse.backend.discussion.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class DiscussionPostResponse {
    private UUID id;
    private UUID courseId;
    private UUID userId;
    private String userName;
    private UUID parentId;
    private String content;
    private LocalDateTime createdAt;
}
