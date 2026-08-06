package com.tiesverse.backend.notes.service;

import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import com.tiesverse.backend.notes.dto.request.CreateNoteRequest;
import com.tiesverse.backend.notes.dto.request.UpdateNoteRequest;
import com.tiesverse.backend.notes.dto.response.NoteResponse;
import com.tiesverse.backend.notes.entity.Note;
import com.tiesverse.backend.notes.repository.NoteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class NoteServiceImpl implements NoteService {

    private final NoteRepository noteRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    @Override
    @Transactional(readOnly = true)
    public List<NoteResponse> getMyNotes(UUID userId, UUID courseId, UUID lessonId) {
        List<Note> notes;
        if (lessonId != null) {
            notes = noteRepository.findByUserIdAndLessonIdOrderByCreatedAtDesc(userId, lessonId);
        } else if (courseId != null) {
            notes = noteRepository.findByUserIdAndCourseIdOrderByCreatedAtDesc(userId, courseId);
        } else {
            notes = noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }
        return notes.stream().map(this::toResponse).toList();
    }

    @Override
    public NoteResponse createNote(UUID userId, CreateNoteRequest request) {
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        if (request.getLessonId() != null && !lessonRepository.existsById(request.getLessonId())) {
            throw new ResourceNotFoundException("Lesson", "id", request.getLessonId());
        }
        Note note = Note.builder()
                .userId(userId)
                .courseId(request.getCourseId())
                .lessonId(request.getLessonId())
                .content(request.getContent())
                .timestampSeconds(request.getTimestampSeconds())
                .build();
        return toResponse(noteRepository.save(note));
    }

    @Override
    public NoteResponse updateNote(UUID userId, UUID noteId, UpdateNoteRequest request) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
        if (!note.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only edit your own notes");
        }
        note.setContent(request.getContent());
        return toResponse(noteRepository.save(note));
    }

    @Override
    public void deleteNote(UUID userId, UUID noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note", "id", noteId));
        if (!note.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own notes");
        }
        noteRepository.delete(note);
    }

    private NoteResponse toResponse(Note note) {
        String courseTitle = courseRepository.findById(note.getCourseId()).map(Course::getTitle).orElse(null);
        String lessonTitle = note.getLessonId() == null ? null
                : lessonRepository.findById(note.getLessonId()).map(Lesson::getTitle).orElse(null);
        return NoteResponse.builder()
                .id(note.getId())
                .courseId(note.getCourseId())
                .courseTitle(courseTitle)
                .lessonId(note.getLessonId())
                .lessonTitle(lessonTitle)
                .content(note.getContent())
                .timestampSeconds(note.getTimestampSeconds())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
