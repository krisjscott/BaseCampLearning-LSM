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
@Table(name = "learning_paths")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LearningPath extends BaseEntity {

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(name = "organization_id")
    private UUID organizationId;

    @Column(name = "assigned_to_user_id")
    private UUID assignedToUserId;
}
