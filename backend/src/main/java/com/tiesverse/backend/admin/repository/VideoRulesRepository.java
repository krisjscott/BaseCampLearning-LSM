package com.tiesverse.backend.admin.repository;

import com.tiesverse.backend.admin.entity.VideoRules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VideoRulesRepository extends JpaRepository<VideoRules, UUID> {
}
