package com.tiesverse.backend.bookmark.repository;

import com.tiesverse.backend.bookmark.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {

    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Bookmark> findByUserIdAndLessonId(UUID userId, UUID lessonId);

    void deleteByUserIdAndLessonId(UUID userId, UUID lessonId);
}
