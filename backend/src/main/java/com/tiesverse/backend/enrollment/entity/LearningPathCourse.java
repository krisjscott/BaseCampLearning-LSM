package com.tiesverse.backend.enrollment.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "learning_path_courses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPathCourse extends BaseEntity {

    @Column(name = "learning_path_id", nullable = false)
    private UUID learningPathId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "order_index")
    private Integer orderIndex;
}
