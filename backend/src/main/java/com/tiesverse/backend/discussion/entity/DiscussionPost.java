package com.tiesverse.backend.discussion.entity;

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
@Table(name = "discussion_posts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscussionPost extends BaseEntity {

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "parent_id")
    private UUID parentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
}
