package com.tiesverse.backend.assignment.dto.response;

import com.tiesverse.backend.common.enums.SubmissionStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AssignmentSubmissionResponse {
    private UUID id;
    private UUID lessonId;
    private String lessonTitle;
    private UUID userId;
    private String userName;
    private String submissionText;
    private String fileUrl;
    private SubmissionStatus status;
    private Integer score;
    private String feedback;
    private String gradedByName;
    private LocalDateTime gradedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
