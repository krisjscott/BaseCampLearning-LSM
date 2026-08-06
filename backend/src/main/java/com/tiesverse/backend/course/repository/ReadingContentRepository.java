package com.tiesverse.backend.course.repository;

import com.tiesverse.backend.course.entity.ReadingContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReadingContentRepository extends JpaRepository<ReadingContent, UUID> {

    Optional<ReadingContent> findByLessonId(UUID lessonId);

    void deleteByLessonIdIn(List<UUID> lessonIds);
}
