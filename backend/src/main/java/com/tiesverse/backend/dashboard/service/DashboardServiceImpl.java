package com.tiesverse.backend.dashboard.service;

import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.dashboard.dto.response.AdminDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.EmployeeDashboardResponse;
import com.tiesverse.backend.dashboard.dto.response.PublicDashboardResponse;
import com.tiesverse.backend.progress.repository.CourseProgressRepository;
import com.tiesverse.backend.user.repository.UserActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final CourseRepository courseRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final UserActivityRepository userActivityRepository;

    @Override
    @Cacheable(value = "publicDashboard", key = "#userId")
    public PublicDashboardResponse getPublicDashboard(UUID userId) {
        List<Course> publishedCourses = courseRepository
                .findByVisibilityAndStatus(CourseVisibility.PUBLIC, CourseStatus.PUBLISHED);

        List<PublicDashboardResponse.ContinueLearningItem> continueLearning = userId == null
                ? List.of()
                : courseProgressRepository.findByUserId(userId).stream()
                        .filter(progress -> progress.getCompletionPercentage() == null
                                || progress.getCompletionPercentage() < 100.0)
                        .sorted(Comparator.comparing(
                                progress -> progress.getLastAccessedAt() == null
                                        ? java.time.LocalDateTime.MIN
                                        : progress.getLastAccessedAt(),
                                Comparator.reverseOrder()))
                        .limit(4)
                        .map(progress -> {
                            Course course = courseRepository.findById(progress.getCourseId()).orElse(null);
                            return PublicDashboardResponse.ContinueLearningItem.builder()
                                    .courseId(progress.getCourseId())
                                    .courseTitle(course == null ? "Course" : course.getTitle())
                                    .thumbnailUrl(course == null ? null : course.getThumbnailUrl())
                                    .completionPercentage(progress.getCompletionPercentage())
                                    .lastAccessedAt(progress.getLastAccessedAt())
                                    .build();
                        })
                        .toList();

        List<PublicDashboardResponse.RecommendedCourseItem> recommendedCourses = publishedCourses.stream()
                .sorted(Comparator
                        .comparing((Course course) -> course.getRating() == null ? java.math.BigDecimal.ZERO : course.getRating())
                        .thenComparing(course -> course.getTotalEnrollments() == null ? 0 : course.getTotalEnrollments())
                        .reversed())
                .limit(6)
                .map(course -> PublicDashboardResponse.RecommendedCourseItem.builder()
                        .courseId(course.getId())
                        .courseTitle(course.getTitle())
                        .thumbnailUrl(course.getThumbnailUrl())
                        .instructorName("BaseCamp Academy")
                        .rating(course.getRating())
                        .totalEnrollments(course.getTotalEnrollments())
                        .build())
                .toList();

        List<PublicDashboardResponse.RecentActivityItem> recentActivities = userId == null
                ? List.of()
                : userActivityRepository.findByUserIdOrderByActivityDateDesc(userId).stream()
                        .limit(5)
                        .map(activity -> PublicDashboardResponse.RecentActivityItem.builder()
                                .activityType(activity.getActivityType())
                                .description(activity.getDescription())
                                .activityDate(activity.getActivityDate())
                                .build())
                        .toList();

        return PublicDashboardResponse.builder()
                .continueLearning(continueLearning)
                .recommendedCourses(recommendedCourses)
                .recentActivities(recentActivities)
                .build();
    }

    @Override
    @Cacheable(value = "employeeDashboard", key = "#userId")
    public EmployeeDashboardResponse getEmployeeDashboard(UUID userId) {
        return EmployeeDashboardResponse.builder()
                .assignedModules(List.of())
                .complianceTraining(List.of())
                .teamProgress(EmployeeDashboardResponse.TeamProgressItem.builder().build())
                .internalCertifications(List.of())
                .build();
    }

    @Override
    @Cacheable(value = "adminDashboard", key = "#organizationId")
    public AdminDashboardResponse getAdminDashboard(UUID organizationId) {
        return AdminDashboardResponse.builder()
                .activeEmployees(0)
                .totalCourses(0)
                .averageCompletionRate(0.0)
                .analytics(List.of())
                .pendingAssignments(List.of())
                .build();
    }
}
