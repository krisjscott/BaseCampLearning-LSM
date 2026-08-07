package com.tiesverse.backend.enrollment.service;

import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.enrollment.dto.request.AssignCourseRequest;
import com.tiesverse.backend.enrollment.dto.request.CreateLearningPathRequest;
import com.tiesverse.backend.enrollment.dto.request.EnrollRequest;
import com.tiesverse.backend.enrollment.dto.response.EnrollmentResponse;
import com.tiesverse.backend.enrollment.dto.response.LearningPathResponse;
import com.tiesverse.backend.enrollment.entity.Enrollment;
import com.tiesverse.backend.enrollment.entity.LearningPath;
import com.tiesverse.backend.enrollment.entity.LearningPathCourse;
import com.tiesverse.backend.enrollment.mapper.EnrollmentMapper;
import com.tiesverse.backend.enrollment.repository.EnrollmentRepository;
import com.tiesverse.backend.enrollment.repository.LearningPathCourseRepository;
import com.tiesverse.backend.enrollment.repository.LearningPathRepository;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.security.AuthContext;
import com.tiesverse.backend.security.OrganizationScope;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final LearningPathRepository learningPathRepository;
    private final LearningPathCourseRepository learningPathCourseRepository;
    private final EnrollmentMapper enrollmentMapper;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AuthContext authContext;
    private final OrganizationScope organizationScope;

    @Override
    @Transactional
    public EnrollmentResponse enroll(EnrollRequest request) {
        enrollmentRepository.findByUserIdAndCourseId(request.getUserId(), request.getCourseId())
                .ifPresent(existing -> {
                    throw new ConflictException("User is already enrolled in this course");
                });

        Enrollment enrollment = Enrollment.builder()
                .userId(request.getUserId())
                .courseId(request.getCourseId())
                .status(EnrollmentStatus.ACTIVE)
                .dueDate(request.getDueDate())
                .enrolledDate(LocalDate.now())
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return enrich(enrollmentMapper.toEnrollmentResponse(enrollment));
    }

    @Override
    @Transactional
    public EnrollmentResponse assignCourse(AssignCourseRequest request, Principal principal) {
        Account caller = authContext.currentAccount(principal);
        organizationScope.requireSameOrganizationAsUser(caller, request.getUserId());

        enrollmentRepository.findByUserIdAndCourseId(request.getUserId(), request.getCourseId())
                .ifPresent(existing -> {
                    throw new ConflictException("User is already enrolled in this course");
                });

        Enrollment enrollment = Enrollment.builder()
                .userId(request.getUserId())
                .courseId(request.getCourseId())
                .status(EnrollmentStatus.ACTIVE)
                .dueDate(request.getDueDate())
                .enrolledDate(LocalDate.now())
                .assignedById(request.getAssignedById())
                .build();

        enrollment = enrollmentRepository.save(enrollment);
        return enrich(enrollmentMapper.toEnrollmentResponse(enrollment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByUser(UUID userId) {
        List<Enrollment> enrollments = enrollmentRepository.findByUserId(userId);
        return enrollmentMapper.toEnrollmentResponseList(enrollments).stream()
                .map(this::enrich)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnrollmentResponse> getEnrollmentsByCourse(UUID courseId) {
        List<Enrollment> enrollments = enrollmentRepository.findByCourseId(courseId);
        return enrollmentMapper.toEnrollmentResponseList(enrollments).stream()
                .map(this::enrich)
                .toList();
    }

    @Override
    @Transactional
    public EnrollmentResponse updateStatus(UUID enrollmentId, EnrollmentStatus status, Principal principal) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment", "id", enrollmentId));

        Account caller = authContext.currentAccount(principal);
        organizationScope.requireSameOrganizationAsUser(caller, enrollment.getUserId());

        enrollment.setStatus(status);
        if (status == EnrollmentStatus.COMPLETED) {
            enrollment.setCompletedDate(LocalDate.now());
        }

        enrollment = enrollmentRepository.save(enrollment);
        return enrich(enrollmentMapper.toEnrollmentResponse(enrollment));
    }

    private EnrollmentResponse enrich(EnrollmentResponse response) {
        if (response.getCourseId() != null) {
            courseRepository.findById(response.getCourseId()).ifPresent(course -> {
                response.setCourseTitle(course.getTitle());
                response.setCourseThumbnail(course.getThumbnailUrl());
            });
        }
        if (response.getUserId() != null) {
            userRepository.findById(response.getUserId())
                    .map(User::getFullName)
                    .ifPresent(response::setUserName);
        }
        return response;
    }

    @Override
    @Transactional
    public LearningPathResponse createLearningPath(CreateLearningPathRequest request) {
        LearningPath learningPath = LearningPath.builder()
                .name(request.getName())
                .description(request.getDescription())
                .organizationId(request.getOrganizationId())
                .build();

        LearningPath savedLearningPath = learningPathRepository.save(learningPath);

        if (request.getCourseIds() != null) {
            AtomicInteger index = new AtomicInteger(0);
            List<LearningPathCourse> courses = request.getCourseIds().stream()
                    .map(courseId -> LearningPathCourse.builder()
                            .learningPathId(savedLearningPath.getId())
                            .courseId(courseId)
                            .orderIndex(index.getAndIncrement())
                            .build())
                    .toList();
            learningPathCourseRepository.saveAll(courses);
        }

        LearningPathResponse response = enrollmentMapper.toLearningPathResponse(savedLearningPath);
        response.setCourseIds(request.getCourseIds());
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public List<LearningPathResponse> getLearningPaths(UUID organizationId) {
        List<LearningPath> paths = learningPathRepository.findByOrganizationId(organizationId);
        return paths.stream().map(path -> {
            List<LearningPathCourse> courses = learningPathCourseRepository
                    .findByLearningPathIdOrderByOrderIndex(path.getId());
            LearningPathResponse response = enrollmentMapper.toLearningPathResponse(path);
            response.setCourseIds(courses.stream().map(LearningPathCourse::getCourseId).toList());
            return response;
        }).toList();
    }
}
