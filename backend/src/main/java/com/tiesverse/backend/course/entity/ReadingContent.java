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

/**
 * HTML/Markdown reading content attached to a single lesson. Distinct from
 * {@code content.entity.Content}, which models uploaded media files
 * (video/document) rather than inline text content. Authored by admins, but
 * lives in the course domain since it's learner-facing lesson content.
 */
@Entity
@Table(name = "reading_contents")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadingContent extends BaseEntity {

    @Column(nullable = false)
    private String title;

    @Column(name = "content_html", columnDefinition = "TEXT")
    private String contentHtml;

    @Column(name = "content_markdown", columnDefinition = "TEXT")
    private String contentMarkdown;

    @Column(name = "estimated_reading_minutes")
    private Integer estimatedReadingMinutes;

    @Column(name = "lesson_id", nullable = false)
    private UUID lessonId;
}
