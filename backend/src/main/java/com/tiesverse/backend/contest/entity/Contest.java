package com.tiesverse.backend.contest.entity;

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

/**
 * A time-boxed leaderboard wrapping an existing quiz Assessment. There is no
 * separate scoring/entry table - standings are derived on read from
 * AssessmentResult rows for {@code assessmentId} within [startAt, endAt].
 */
@Entity
@Table(name = "contests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contest extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "assessment_id", nullable = false)
    private UUID assessmentId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "created_by_id")
    private UUID createdById;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;
}
