package com.tiesverse.backend.course.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import com.tiesverse.backend.common.enums.ContentType;
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

import java.util.UUID;

@Entity
@Table(name = "lessons")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lesson extends BaseEntity {

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "content_url")
    private String contentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type")
    private ContentType contentType;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Column(name = "module_id", nullable = false)
    private UUID moduleId;
}
