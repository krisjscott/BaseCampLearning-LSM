package com.tiesverse.backend.progress.repository;

import com.tiesverse.backend.progress.entity.LessonProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface LessonProgressRepository extends JpaRepository<LessonProgress, UUID> {

    Optional<LessonProgress> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    List<LessonProgress> findByUserIdAndLessonIdIn(UUID userId, List<UUID> lessonIds);

    long countByUserIdAndCompletedTrue(UUID userId);

    void deleteByLessonIdIn(List<UUID> lessonIds);
}
