package com.tiesverse.backend.progress.service;

import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.progress.dto.request.UpdateProgressRequest;
import com.tiesverse.backend.progress.dto.response.CourseProgressResponse;
import com.tiesverse.backend.progress.dto.response.LessonProgressResponse;
import com.tiesverse.backend.progress.entity.CourseProgress;
import com.tiesverse.backend.progress.entity.LessonProgress;
import com.tiesverse.backend.progress.mapper.ProgressMapper;
import com.tiesverse.backend.progress.repository.CourseProgressRepository;
import com.tiesverse.backend.progress.repository.LessonProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final ProgressMapper progressMapper;

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(UUID userId, UUID courseId) {
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseProgress", "userId and courseId", userId));
        return progressMapper.toCourseProgressResponse(progress);
    }

    @Override
    @Transactional
    public CourseProgressResponse updateLessonProgress(UUID userId, UUID courseId, UpdateProgressRequest request) {
        LessonProgress lessonProgress = lessonProgressRepository
                .findByUserIdAndLessonId(userId, request.getLessonId())
                .orElseGet(() -> LessonProgress.builder()
                        .userId(userId)
                        .lessonId(request.getLessonId())
                        .build());

        lessonProgress.setCompleted(request.isCompleted());
        lessonProgress.setTimeSpentMinutes(request.getTimeSpentMinutes());
        if (request.isCompleted()) {
            lessonProgress.setCompletedAt(LocalDateTime.now());
        }
        lessonProgressRepository.save(lessonProgress);

        CourseProgress courseProgress = courseProgressRepository
                .findByUserIdAndCourseId(userId, courseId)
                .orElseGet(() -> CourseProgress.builder()
                        .userId(userId)
                        .courseId(courseId)
                        .completionPercentage(0.0)
                        .timeSpentMinutes(0)
                        .build());

        courseProgress.setLastLessonId(request.getLessonId());
        courseProgress.setLastAccessedAt(LocalDateTime.now());

        if (request.getTimeSpentMinutes() != null) {
            int currentMinutes = courseProgress.getTimeSpentMinutes() != null ? courseProgress.getTimeSpentMinutes() : 0;
            courseProgress.setTimeSpentMinutes(currentMinutes + request.getTimeSpentMinutes());
        }

        courseProgress = courseProgressRepository.save(courseProgress);
        return progressMapper.toCourseProgressResponse(courseProgress);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getResumePoint(UUID userId, UUID courseId) {
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseProgress", "userId and courseId", userId));
        return progressMapper.toCourseProgressResponse(progress);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonProgressResponse> getLessonProgress(UUID userId, List<UUID> lessonIds) {
        List<LessonProgress> progressList = lessonProgressRepository.findByUserIdAndLessonIdIn(userId, lessonIds);
        return progressMapper.toLessonProgressResponseList(progressList);
    }
}
