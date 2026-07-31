package com.tiesverse.backend.auth.service;

import com.tiesverse.backend.certificate.entity.Certificate;
import com.tiesverse.backend.certificate.repository.CertificateRepository;
import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.common.enums.NotificationCategory;
import com.tiesverse.backend.common.enums.NotificationType;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.repository.CourseModuleRepository;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import com.tiesverse.backend.enrollment.entity.Enrollment;
import com.tiesverse.backend.enrollment.repository.EnrollmentRepository;
import com.tiesverse.backend.notification.entity.Notification;
import com.tiesverse.backend.notification.repository.NotificationRepository;
import com.tiesverse.backend.progress.entity.CourseProgress;
import com.tiesverse.backend.progress.repository.CourseProgressRepository;
import com.tiesverse.backend.user.entity.UserActivity;
import com.tiesverse.backend.user.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DemoExperienceService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final CertificateRepository certificateRepository;
    private final NotificationRepository notificationRepository;
    private final UserActivityRepository userActivityRepository;

    public void attachDemoExperience(UUID userId, String learnerName) {
        List<Course> courses = courseRepository
                .findByVisibilityAndStatus(CourseVisibility.PUBLIC, CourseStatus.PUBLISHED)
                .stream()
                .limit(3)
                .toList();

        if (courses.isEmpty()) {
            return;
        }

        for (int index = 0; index < courses.size(); index++) {
            Course course = courses.get(index);
            double completion = switch (index) {
                case 0 -> 58.0;
                case 1 -> 24.0;
                default -> 100.0;
            };

            enrollmentRepository.save(Enrollment.builder()
                    .userId(userId)
                    .courseId(course.getId())
                    .status(completion >= 100.0 ? EnrollmentStatus.COMPLETED : EnrollmentStatus.ACTIVE)
                    .dueDate(LocalDate.now().plusDays(21 + (index * 7L)))
                    .enrolledDate(LocalDate.now().minusDays(8 - Math.min(index, 2)))
                    .completedDate(completion >= 100.0 ? LocalDate.now().minusDays(2) : null)
                    .assignedById(userId)
                    .build());

            UUID lastLessonId = courseModuleRepository.findByCourseIdOrderByOrderIndex(course.getId()).stream()
                    .findFirst()
                    .flatMap(module -> lessonRepository.findByModuleIdOrderByOrderIndex(module.getId()).stream().findFirst())
                    .map(Lesson::getId)
                    .orElse(null);

            courseProgressRepository.save(CourseProgress.builder()
                    .userId(userId)
                    .courseId(course.getId())
                    .lastLessonId(lastLessonId)
                    .completionPercentage(completion)
                    .timeSpentMinutes(60 + (index * 45))
                    .lastAccessedAt(LocalDateTime.now().minusDays(index))
                    .build());
        }

        Course certificateCourse = courses.get(courses.size() - 1);
        certificateRepository.save(Certificate.builder()
                .userId(userId)
                .courseId(certificateCourse.getId())
                .certificateNumber("BC-DEMO-" + LocalDate.now().getYear() + "-" + userId.toString().substring(0, 8).toUpperCase())
                .title("Certificate of Completion")
                .recipientName(learnerName)
                .courseName(certificateCourse.getTitle())
                .issuerName("BaseCamp Academy")
                .issuedDate(LocalDate.now().minusDays(2))
                .fileUrl("/certificates/demo-" + userId + ".pdf")
                .build());

        notificationRepository.saveAll(List.of(
                Notification.builder()
                        .userId(userId)
                        .title("Certificate ready")
                        .message("Your " + certificateCourse.getTitle() + " certificate is ready to view.")
                        .type(NotificationType.IN_APP)
                        .category(NotificationCategory.CERTIFICATE_READY)
                        .read(false)
                        .actionUrl("/certificates")
                        .build(),
                Notification.builder()
                        .userId(userId)
                        .title("New module unlocked")
                        .message(courses.get(0).getTitle() + " has a new guided lesson ready.")
                        .type(NotificationType.IN_APP)
                        .category(NotificationCategory.COURSE_ASSIGNED)
                        .read(false)
                        .actionUrl("/my-learning")
                        .build(),
                Notification.builder()
                        .userId(userId)
                        .title("Deadline reminder")
                        .message(courses.get(0).getTitle() + " is due in three weeks.")
                        .type(NotificationType.IN_APP)
                        .category(NotificationCategory.DEADLINE_REMINDER)
                        .read(true)
                        .readAt(LocalDateTime.now().minusHours(4))
                        .actionUrl("/learning")
                        .build()));

        userActivityRepository.saveAll(List.of(
                UserActivity.builder()
                        .userId(userId)
                        .activityType("COURSE_PROGRESS")
                        .description("Started " + courses.get(0).getTitle() + " from the local demo registration flow.")
                        .activityDate(LocalDateTime.now().minusHours(2))
                        .build(),
                UserActivity.builder()
                        .userId(userId)
                        .activityType("CERTIFICATE_READY")
                        .description("Earned the " + certificateCourse.getTitle() + " certificate.")
                        .activityDate(LocalDateTime.now().minusDays(2))
                        .build()));
    }
}
