package com.tiesverse.backend.progress.service;

import com.tiesverse.backend.progress.dto.request.UpdateProgressRequest;
import com.tiesverse.backend.progress.dto.response.CourseProgressResponse;
import com.tiesverse.backend.progress.dto.response.LessonProgressResponse;

import java.util.List;
import java.util.UUID;

public interface ProgressService {

    CourseProgressResponse getCourseProgress(UUID userId, UUID courseId);

    CourseProgressResponse updateLessonProgress(UUID userId, UUID courseId, UpdateProgressRequest request);

    CourseProgressResponse getResumePoint(UUID userId, UUID courseId);

    List<LessonProgressResponse> getLessonProgress(UUID userId, List<UUID> lessonIds);
}
