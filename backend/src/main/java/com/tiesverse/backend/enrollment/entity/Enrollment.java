package com.tiesverse.backend.enrollment.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import com.tiesverse.backend.common.enums.EnrollmentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "enrollments", uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "courseId"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Enrollment extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EnrollmentStatus status;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "enrolled_date")
    private LocalDate enrolledDate;

    @Column(name = "completed_date")
    private LocalDate completedDate;

    @Column(name = "assigned_by_id")
    private UUID assignedById;
}
