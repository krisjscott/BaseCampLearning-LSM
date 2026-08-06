package com.tiesverse.backend.notes.repository;

import com.tiesverse.backend.notes.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NoteRepository extends JpaRepository<Note, UUID> {

    List<Note> findByUserIdOrderByCreatedAtDesc(UUID userId);

    List<Note> findByUserIdAndCourseIdOrderByCreatedAtDesc(UUID userId, UUID courseId);

    List<Note> findByUserIdAndLessonIdOrderByCreatedAtDesc(UUID userId, UUID lessonId);
}
