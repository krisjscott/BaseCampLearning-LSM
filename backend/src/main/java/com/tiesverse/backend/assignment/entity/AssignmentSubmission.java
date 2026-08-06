package com.tiesverse.backend.assignment.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import com.tiesverse.backend.common.enums.SubmissionStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assignment_submissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssignmentSubmission extends BaseEntity {

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;

    @Column(name = "file_url")
    private String fileUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubmissionStatus status;

    private Integer score;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "graded_by_id")
    private UUID gradedById;

    @Column(name = "graded_at")
    private LocalDateTime gradedAt;
}
