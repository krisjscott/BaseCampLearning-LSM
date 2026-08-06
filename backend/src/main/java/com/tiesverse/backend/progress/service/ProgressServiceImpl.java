package com.tiesverse.backend.progress.service;

import com.tiesverse.backend.certificate.service.CertificateIssuanceService;
import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.CourseModule;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.repository.CourseModuleRepository;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import com.tiesverse.backend.enrollment.repository.EnrollmentRepository;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProgressServiceImpl implements ProgressService {

    private final CourseProgressRepository courseProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateIssuanceService certificateIssuanceService;
    private final ProgressMapper progressMapper;

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getCourseProgress(UUID userId, UUID courseId) {
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseProgress", "userId and courseId", userId));
        return enrich(progressMapper.toCourseProgressResponse(progress));
    }

    private CourseProgressResponse enrich(CourseProgressResponse response) {
        if (response.getCourseId() != null) {
            response.setCourseTitle(courseRepository.findById(response.getCourseId()).map(Course::getTitle).orElse(null));
        }
        if (response.getLastLessonId() != null) {
            response.setLastLessonTitle(lessonRepository.findById(response.getLastLessonId()).map(Lesson::getTitle).orElse(null));
        }
        return response;
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

        recomputeCompletion(userId, courseId, courseProgress);

        courseProgress = courseProgressRepository.save(courseProgress);
        return enrich(progressMapper.toCourseProgressResponse(courseProgress));
    }

    /**
     * There is no other "course completed" signal anywhere in the app — completing the last
     * lesson is the only trigger, so it doubles as the point where the enrollment is marked
     * COMPLETED and, if the course has a certificate template configured, a certificate is
     * auto-issued.
     */
    private void recomputeCompletion(UUID userId, UUID courseId, CourseProgress courseProgress) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndex(courseId);
        if (modules.isEmpty()) return;
        List<UUID> moduleIds = modules.stream().map(CourseModule::getId).toList();

        List<Lesson> lessons = lessonRepository.findByModuleIdInOrderByOrderIndex(moduleIds);
        if (lessons.isEmpty()) return;
        List<UUID> lessonIds = lessons.stream().map(Lesson::getId).toList();

        List<LessonProgress> progressList = lessonProgressRepository.findByUserIdAndLessonIdIn(userId, lessonIds);
        long completedCount = progressList.stream().filter(LessonProgress::isCompleted).count();

        double percentage = (completedCount * 100.0) / lessons.size();
        courseProgress.setCompletionPercentage(percentage);

        if (completedCount < lessons.size()) return;

        enrollmentRepository.findByUserIdAndCourseId(userId, courseId).ifPresent(enrollment -> {
            if (enrollment.getStatus() != EnrollmentStatus.COMPLETED) {
                enrollment.setStatus(EnrollmentStatus.COMPLETED);
                enrollment.setCompletedDate(LocalDate.now());
                enrollmentRepository.save(enrollment);
            }
        });

        certificateIssuanceService.issueIfEligible(userId, courseId);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseProgressResponse getResumePoint(UUID userId, UUID courseId) {
        CourseProgress progress = courseProgressRepository.findByUserIdAndCourseId(userId, courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CourseProgress", "userId and courseId", userId));
        return enrich(progressMapper.toCourseProgressResponse(progress));
    }

    @Override
    @Transactional(readOnly = true)
    public List<LessonProgressResponse> getLessonProgress(UUID userId, List<UUID> lessonIds) {
        List<LessonProgress> progressList = lessonProgressRepository.findByUserIdAndLessonIdIn(userId, lessonIds);
        List<LessonProgressResponse> responses = progressMapper.toLessonProgressResponseList(progressList);
        responses.forEach(response -> {
            if (response.getLessonId() != null) {
                response.setLessonTitle(lessonRepository.findById(response.getLessonId()).map(Lesson::getTitle).orElse(null));
            }
        });
        return responses;
    }
}
