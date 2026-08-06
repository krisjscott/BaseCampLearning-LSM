package com.tiesverse.backend.bookmark.service;

import com.tiesverse.backend.bookmark.dto.request.CreateBookmarkRequest;
import com.tiesverse.backend.bookmark.dto.response.BookmarkResponse;
import com.tiesverse.backend.bookmark.entity.Bookmark;
import com.tiesverse.backend.bookmark.repository.BookmarkRepository;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookmarkServiceImpl implements BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;

    @Override
    @Transactional(readOnly = true)
    public List<BookmarkResponse> getMyBookmarks(UUID userId) {
        return bookmarkRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BookmarkResponse createBookmark(UUID userId, CreateBookmarkRequest request) {
        if (!lessonRepository.existsById(request.getLessonId())) {
            throw new ResourceNotFoundException("Lesson", "id", request.getLessonId());
        }
        bookmarkRepository.findByUserIdAndLessonId(userId, request.getLessonId()).ifPresent(existing -> {
            throw new ConflictException("This lesson is already bookmarked");
        });
        Bookmark bookmark = Bookmark.builder()
                .userId(userId)
                .courseId(request.getCourseId())
                .lessonId(request.getLessonId())
                .build();
        return toResponse(bookmarkRepository.save(bookmark));
    }

    @Override
    public void deleteBookmark(UUID userId, UUID lessonId) {
        bookmarkRepository.deleteByUserIdAndLessonId(userId, lessonId);
    }

    private BookmarkResponse toResponse(Bookmark bookmark) {
        String courseTitle = courseRepository.findById(bookmark.getCourseId()).map(Course::getTitle).orElse(null);
        String lessonTitle = lessonRepository.findById(bookmark.getLessonId()).map(Lesson::getTitle).orElse(null);
        return BookmarkResponse.builder()
                .id(bookmark.getId())
                .courseId(bookmark.getCourseId())
                .courseTitle(courseTitle)
                .lessonId(bookmark.getLessonId())
                .lessonTitle(lessonTitle)
                .createdAt(bookmark.getCreatedAt())
                .build();
    }
}
