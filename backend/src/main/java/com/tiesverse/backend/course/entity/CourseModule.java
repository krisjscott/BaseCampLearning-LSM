package com.tiesverse.backend.course.entity;

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
@Table(name = "course_modules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CourseModule extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;
}
