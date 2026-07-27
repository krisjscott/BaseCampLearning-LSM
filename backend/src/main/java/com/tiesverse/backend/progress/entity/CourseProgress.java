package com.tiesverse.backend.progress.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "course_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "courseId"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseProgress extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "last_lesson_id")
    private UUID lastLessonId;

    @Column(name = "completion_percentage")
    private Double completionPercentage;

    @Column(name = "time_spent_minutes")
    private Integer timeSpentMinutes;

    @Column(name = "last_accessed_at")
    private LocalDateTime lastAccessedAt;
}
