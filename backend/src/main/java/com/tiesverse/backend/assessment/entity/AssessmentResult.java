package com.tiesverse.backend.assessment.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_results")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AssessmentResult extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "assessment_id", nullable = false)
    private UUID assessmentId;

    private Integer score;

    @Column(name = "attempt_number")
    private Integer attemptNumber;

    private boolean passed;

    @Column(name = "submitted_at")
    private LocalDateTime submittedAt;
}
