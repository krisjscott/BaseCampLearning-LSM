package com.tiesverse.backend.contest.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ContestResponse {
    private UUID id;
    private String title;
    private String description;
    private UUID assessmentId;
    private String assessmentTitle;
    private UUID courseId;
    private String courseTitle;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private String status;
}
