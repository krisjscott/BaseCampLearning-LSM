package com.tiesverse.backend.admin.service;

import com.tiesverse.backend.admin.dto.request.CreateAdminAccountRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminAssessmentRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminCourseRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminLessonRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminModuleRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminQuestionRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminReadingContentRequest;
import com.tiesverse.backend.admin.dto.request.ReorderLessonsRequest;
import com.tiesverse.backend.admin.dto.request.ReorderModulesRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminAccountRoleRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminAssessmentRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminCourseRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminLessonRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminModuleRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminReadingContentRequest;
import com.tiesverse.backend.admin.dto.request.UpdateVideoRulesRequest;
import com.tiesverse.backend.admin.dto.response.AdminAccountResponse;
import com.tiesverse.backend.admin.dto.response.AdminLearnerResponse;
import com.tiesverse.backend.admin.dto.response.AdminCourseListResponse;
import com.tiesverse.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.tiesverse.backend.admin.dto.response.AdminLessonResponse;
import com.tiesverse.backend.admin.dto.response.AdminModuleResponse;
import com.tiesverse.backend.admin.dto.response.AdminQuestionOptionResponse;
import com.tiesverse.backend.admin.dto.response.AdminQuestionResponse;
import com.tiesverse.backend.admin.dto.response.AdminQuizBuilderResponse;
import com.tiesverse.backend.admin.dto.response.AdminReadingContentResponse;
import com.tiesverse.backend.admin.dto.response.AdminVideoRulesResponse;
import com.tiesverse.backend.admin.dto.response.AuditLogResponse;
import com.tiesverse.backend.admin.entity.AuditLog;
import com.tiesverse.backend.admin.entity.VideoRules;
import com.tiesverse.backend.admin.repository.AuditLogRepository;
import com.tiesverse.backend.admin.repository.VideoRulesRepository;
import com.tiesverse.backend.assessment.entity.Assessment;
import com.tiesverse.backend.assessment.entity.AssessmentResult;
import com.tiesverse.backend.assessment.entity.Question;
import com.tiesverse.backend.assessment.entity.QuestionOption;
import com.tiesverse.backend.assessment.repository.AnswerRepository;
import com.tiesverse.backend.assessment.repository.AssessmentRepository;
import com.tiesverse.backend.assessment.repository.AssessmentResultRepository;
import com.tiesverse.backend.assessment.repository.QuestionOptionRepository;
import com.tiesverse.backend.assessment.repository.QuestionRepository;
import com.tiesverse.backend.assignment.dto.request.GradeSubmissionRequest;
import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import com.tiesverse.backend.assignment.service.AssignmentService;
import com.tiesverse.backend.contest.dto.request.CreateContestRequest;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;
import com.tiesverse.backend.contest.service.ContestService;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.auth.repository.AccountRepository;
import com.tiesverse.backend.certificate.repository.CertificateRepository;
import com.tiesverse.backend.common.enums.AssessmentType;
import com.tiesverse.backend.common.enums.AuthProvider;
import com.tiesverse.backend.common.enums.CourseStatus;
import com.tiesverse.backend.common.enums.CourseVisibility;
import com.tiesverse.backend.common.enums.EnrollmentStatus;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.common.response.PageResponse;
import com.tiesverse.backend.common.storage.FileStorageService;
import com.tiesverse.backend.common.storage.SubtitleConverter;
import com.tiesverse.backend.content.repository.ContentRepository;
import com.tiesverse.backend.course.entity.Category;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.entity.CourseModule;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.course.entity.ReadingContent;
import com.tiesverse.backend.course.repository.CategoryRepository;
import com.tiesverse.backend.course.repository.CourseModuleRepository;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.course.repository.LessonRepository;
import com.tiesverse.backend.course.repository.ReadingContentRepository;
import com.tiesverse.backend.enrollment.repository.EnrollmentRepository;
import com.tiesverse.backend.progress.repository.CourseProgressRepository;
import com.tiesverse.backend.progress.repository.LessonProgressRepository;
import com.tiesverse.backend.security.AuthContext;
import com.tiesverse.backend.organization.entity.Employee;
import com.tiesverse.backend.organization.repository.EmployeeRepository;
import com.tiesverse.backend.organization.repository.OrganizationRepository;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminServiceImpl implements AdminService {

    private static final Set<Role> ADMIN_TIER_ROLES = Set.of(
            Role.HR_ADMIN, Role.ORGANIZATION_ADMIN, Role.SUPER_ADMIN);

    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final CourseModuleRepository courseModuleRepository;
    private final LessonRepository lessonRepository;
    private final AssessmentRepository assessmentRepository;
    private final QuestionRepository questionRepository;
    private final QuestionOptionRepository questionOptionRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final AnswerRepository answerRepository;
    private final VideoRulesRepository videoRulesRepository;
    private final ReadingContentRepository readingContentRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final ContentRepository contentRepository;
    private final CourseProgressRepository courseProgressRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final AccountRepository accountRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthContext authContext;
    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final FileStorageService fileStorageService;
    private final AssignmentService assignmentService;
    private final ContestService contestService;

    // =========================================================================
    // Dashboard
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCourses = courseRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        long activeEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.ACTIVE);
        long completedEnrollments = enrollmentRepository.countByStatus(EnrollmentStatus.COMPLETED);
        double completionRate = totalEnrollments == 0
                ? 0.0
                : (completedEnrollments * 100.0) / totalEnrollments;

        Double revenue = courseRepository.sumRevenue();
        BigDecimal totalRevenue = BigDecimal.valueOf(revenue == null ? 0.0 : revenue);

        long totalAssessments = assessmentRepository.count();
        long totalCertificatesIssued = certificateRepository.count();
        long pendingReviews = courseRepository.countByStatus(CourseStatus.DRAFT);

        return AdminDashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalCourses(totalCourses)
                .totalEnrollments(totalEnrollments)
                .activeEnrollments(activeEnrollments)
                .completedEnrollments(completedEnrollments)
                .completionRate(completionRate)
                .totalRevenue(totalRevenue)
                .totalAssessments(totalAssessments)
                .totalCertificatesIssued(totalCertificatesIssued)
                .pendingReviews(pendingReviews)
                .build();
    }

    // =========================================================================
    // Course Management
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminCourseListResponse> getCourses(int page, int size, String search, String status, String visibility) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 20 : size);
        CourseStatus statusEnum = parseEnumOrNull(CourseStatus.class, status);
        CourseVisibility visibilityEnum = parseEnumOrNull(CourseVisibility.class, visibility);
        String normalizedSearch = StringUtils.hasText(search) ? search : "";

        Page<Course> coursePage = courseRepository.findAdminCourses(normalizedSearch, statusEnum, visibilityEnum, pageable);

        return PageResponse.<AdminCourseListResponse>builder()
                .content(toAdminCourseResponses(coursePage.getContent()))
                .page(coursePage.getNumber())
                .size(coursePage.getSize())
                .totalElements(coursePage.getTotalElements())
                .totalPages(coursePage.getTotalPages())
                .last(coursePage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminCourseListResponse getCourse(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        return toAdminCourseResponse(course);
    }

    @Override
    public AdminCourseListResponse createCourse(CreateAdminCourseRequest request, Principal principal) {
        if (!categoryRepository.existsById(request.getCategoryId())) {
            throw new ResourceNotFoundException("Category", "id", request.getCategoryId());
        }
        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .thumbnailUrl(request.getThumbnailUrl())
                .categoryId(request.getCategoryId())
                .organizationId(request.getOrganizationId())
                .visibility(request.getVisibility())
                .status(request.getStatus())
                .durationHours(request.getDurationHours())
                .price(request.getPrice())
                .rating(BigDecimal.ZERO)
                .totalEnrollments(0)
                .build();
        Course saved = courseRepository.save(course);
        recordAudit(authContext.currentUserId(principal), "CREATE_COURSE", "COURSE", saved.getId(),
                "Created course: " + saved.getTitle());
        return toAdminCourseResponse(saved);
    }

    @Override
    public AdminCourseListResponse updateCourse(UUID id, UpdateAdminCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        if (request.getTitle() != null) course.setTitle(request.getTitle());
        if (request.getDescription() != null) course.setDescription(request.getDescription());
        if (request.getThumbnailUrl() != null) course.setThumbnailUrl(request.getThumbnailUrl());
        if (request.getCategoryId() != null) {
            if (!categoryRepository.existsById(request.getCategoryId())) {
                throw new ResourceNotFoundException("Category", "id", request.getCategoryId());
            }
            course.setCategoryId(request.getCategoryId());
        }
        if (request.getOrganizationId() != null) course.setOrganizationId(request.getOrganizationId());
        if (request.getVisibility() != null) course.setVisibility(request.getVisibility());
        if (request.getStatus() != null) course.setStatus(request.getStatus());
        if (request.getDurationHours() != null) course.setDurationHours(request.getDurationHours());
        if (request.getPrice() != null) course.setPrice(request.getPrice());

        return toAdminCourseResponse(courseRepository.save(course));
    }

    @Override
    public void deleteCourse(UUID id, Principal principal) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));

        List<UUID> moduleIds = courseModuleRepository.findByCourseIdOrderByOrderIndex(id).stream()
                .map(CourseModule::getId)
                .toList();
        List<UUID> lessonIds = moduleIds.isEmpty()
                ? List.of()
                : lessonRepository.findByModuleIdInOrderByOrderIndex(moduleIds).stream()
                        .map(Lesson::getId)
                        .toList();
        List<UUID> assessmentIds = assessmentRepository.findByCourseId(id).stream()
                .map(Assessment::getId)
                .toList();

        if (!lessonIds.isEmpty()) {
            lessonProgressRepository.deleteByLessonIdIn(lessonIds);
            readingContentRepository.deleteByLessonIdIn(lessonIds);
        }

        for (UUID assessmentId : assessmentIds) {
            deleteQuestionsForAssessment(assessmentId);
        }
        if (!assessmentIds.isEmpty()) {
            List<UUID> resultIds = assessmentResultRepository.findByAssessmentIdIn(assessmentIds).stream()
                    .map(AssessmentResult::getId)
                    .toList();
            if (!resultIds.isEmpty()) {
                answerRepository.deleteByResultIdIn(resultIds);
            }
            assessmentResultRepository.deleteByAssessmentIdIn(assessmentIds);
        }
        assessmentRepository.deleteByCourseId(id);

        certificateRepository.deleteByCourseId(id);
        if (!moduleIds.isEmpty()) {
            lessonRepository.deleteByModuleIdIn(moduleIds);
        }
        courseModuleRepository.deleteByCourseId(id);
        courseProgressRepository.deleteByCourseId(id);
        enrollmentRepository.deleteByCourseId(id);
        contentRepository.deleteByCourseId(id);

        courseRepository.delete(course);

        recordAudit(authContext.currentUserId(principal), "DELETE_COURSE", "COURSE", id,
                "Deleted course: " + course.getTitle());
    }

    @Override
    public AdminCourseListResponse publishCourse(UUID id, Principal principal) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        course.setStatus(CourseStatus.PUBLISHED);
        Course saved = courseRepository.save(course);
        recordAudit(authContext.currentUserId(principal), "PUBLISH_COURSE", "COURSE", saved.getId(),
                "Published course: " + saved.getTitle());
        return toAdminCourseResponse(saved);
    }

    @Override
    public AdminCourseListResponse archiveCourse(UUID id, Principal principal) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", id));
        course.setStatus(CourseStatus.ARCHIVED);
        Course saved = courseRepository.save(course);
        recordAudit(authContext.currentUserId(principal), "ARCHIVE_COURSE", "COURSE", saved.getId(),
                "Archived course: " + saved.getTitle());
        return toAdminCourseResponse(saved);
    }

    // =========================================================================
    // Curriculum Builder - Modules
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<AdminModuleResponse> getCourseModules(UUID courseId) {
        List<CourseModule> modules = courseModuleRepository.findByCourseIdOrderByOrderIndex(courseId);
        List<UUID> moduleIds = modules.stream().map(CourseModule::getId).toList();
        Map<UUID, List<Lesson>> lessonsByModuleId = moduleIds.isEmpty()
                ? Map.of()
                : lessonRepository.findByModuleIdInOrderByOrderIndex(moduleIds).stream()
                        .collect(Collectors.groupingBy(Lesson::getModuleId));

        return modules.stream()
                .map(module -> toAdminModuleResponse(module,
                        lessonsByModuleId.getOrDefault(module.getId(), List.of()).stream()
                                .map(this::toAdminLessonResponse)
                                .toList()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminModuleResponse getModule(UUID id) {
        CourseModule module = courseModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        return toAdminModuleResponse(module);
    }

    @Override
    public AdminModuleResponse createModule(CreateAdminModuleRequest request) {
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        CourseModule module = CourseModule.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .orderIndex(request.getOrderIndex())
                .courseId(request.getCourseId())
                .build();
        return toAdminModuleResponse(courseModuleRepository.save(module));
    }

    @Override
    public AdminModuleResponse updateModule(UUID id, UpdateAdminModuleRequest request) {
        CourseModule module = courseModuleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        if (request.getTitle() != null) module.setTitle(request.getTitle());
        if (request.getDescription() != null) module.setDescription(request.getDescription());
        if (request.getOrderIndex() != null) module.setOrderIndex(request.getOrderIndex());
        return toAdminModuleResponse(courseModuleRepository.save(module));
    }

    @Override
    public void deleteModule(UUID id) {
        if (!courseModuleRepository.existsById(id)) {
            throw new ResourceNotFoundException("Module", "id", id);
        }
        List<UUID> lessonIds = lessonRepository.findByModuleIdOrderByOrderIndex(id).stream()
                .map(Lesson::getId)
                .toList();
        if (!lessonIds.isEmpty()) {
            lessonProgressRepository.deleteByLessonIdIn(lessonIds);
            readingContentRepository.deleteByLessonIdIn(lessonIds);
        }
        lessonRepository.deleteByModuleIdIn(List.of(id));
        courseModuleRepository.deleteById(id);
    }

    @Override
    public void reorderModules(UUID courseId, ReorderModulesRequest request) {
        if (request.getModules() == null) return;
        for (ReorderModulesRequest.ModuleOrderItem item : request.getModules()) {
            UUID moduleId = parseUuid(item.getId(), "module id");
            courseModuleRepository.findById(moduleId).ifPresent(module -> {
                module.setOrderIndex(item.getOrderIndex());
                courseModuleRepository.save(module);
            });
        }
    }

    // =========================================================================
    // Curriculum Builder - Lessons
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<AdminLessonResponse> getModuleLessons(UUID moduleId) {
        return lessonRepository.findByModuleIdOrderByOrderIndex(moduleId).stream()
                .map(this::toAdminLessonResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminLessonResponse getLesson(UUID id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        return toAdminLessonResponse(lesson);
    }

    @Override
    public AdminLessonResponse createLesson(CreateAdminLessonRequest request) {
        if (!courseModuleRepository.existsById(request.getModuleId())) {
            throw new ResourceNotFoundException("Module", "id", request.getModuleId());
        }
        Lesson lesson = Lesson.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .contentUrl(request.getContentUrl())
                .contentType(request.getContentType())
                .durationMinutes(request.getDurationMinutes())
                .orderIndex(request.getOrderIndex())
                .moduleId(request.getModuleId())
                .build();
        return toAdminLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public AdminLessonResponse updateLesson(UUID id, UpdateAdminLessonRequest request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", id));
        if (request.getTitle() != null) lesson.setTitle(request.getTitle());
        if (request.getDescription() != null) lesson.setDescription(request.getDescription());
        if (request.getContentUrl() != null) lesson.setContentUrl(request.getContentUrl());
        if (request.getContentType() != null) lesson.setContentType(request.getContentType());
        if (request.getDurationMinutes() != null) lesson.setDurationMinutes(request.getDurationMinutes());
        if (request.getOrderIndex() != null) lesson.setOrderIndex(request.getOrderIndex());
        return toAdminLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public void deleteLesson(UUID id) {
        if (!lessonRepository.existsById(id)) {
            throw new ResourceNotFoundException("Lesson", "id", id);
        }
        lessonProgressRepository.deleteByLessonIdIn(List.of(id));
        readingContentRepository.deleteByLessonIdIn(List.of(id));
        lessonRepository.deleteById(id);
    }

    @Override
    public void reorderLessons(UUID moduleId, ReorderLessonsRequest request) {
        if (request.getLessons() == null) return;
        for (ReorderLessonsRequest.LessonOrderItem item : request.getLessons()) {
            UUID lessonId = parseUuid(item.getId(), "lesson id");
            lessonRepository.findById(lessonId).ifPresent(lesson -> {
                lesson.setOrderIndex(item.getOrderIndex());
                lessonRepository.save(lesson);
            });
        }
    }

    // =========================================================================
    // Video Rules (single global settings row)
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public AdminVideoRulesResponse getVideoRules() {
        return toAdminVideoRulesResponse(getOrCreateVideoRules());
    }

    @Override
    public AdminVideoRulesResponse updateVideoRules(UpdateVideoRulesRequest request, Principal principal) {
        VideoRules rules = getOrCreateVideoRules();
        rules.setAllowedFormats(request.getAllowedFormats());
        rules.setMaxFileSizeBytes(request.getMaxFileSizeBytes());
        rules.setMaxDurationMinutes(request.getMaxDurationMinutes());
        rules.setAllowedCodecs(request.getAllowedCodecs());
        rules.setDefaultEncodingProfile(request.getDefaultEncodingProfile());
        rules.setRequireTranscoding(request.getRequireTranscoding());
        rules.setAutoGenerateThumbnails(request.getAutoGenerateThumbnails());
        VideoRules saved = videoRulesRepository.save(rules);
        recordAudit(authContext.currentUserId(principal), "UPDATE_VIDEO_RULES", "VIDEO_RULES", saved.getId(),
                "Updated video rules");
        return toAdminVideoRulesResponse(saved);
    }

    private VideoRules getOrCreateVideoRules() {
        return videoRulesRepository.findAll().stream().findFirst()
                .orElseGet(() -> videoRulesRepository.save(VideoRules.builder()
                        .allowedFormats(List.of("MP4", "MOV", "AVI"))
                        .maxFileSizeBytes(2_147_483_648L)
                        .maxDurationMinutes(120)
                        .allowedCodecs(List.of("H264", "H265"))
                        .defaultEncodingProfile("STANDARD")
                        .requireTranscoding(true)
                        .autoGenerateThumbnails(true)
                        .build()));
    }

    // =========================================================================
    // Reading Content
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public AdminReadingContentResponse getReadingContent(UUID lessonId) {
        ReadingContent content = readingContentRepository.findByLessonId(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("ReadingContent", "lessonId", lessonId));
        return toAdminReadingContentResponse(content);
    }

    @Override
    public AdminReadingContentResponse createReadingContent(CreateAdminReadingContentRequest request) {
        if (!lessonRepository.existsById(request.getLessonId())) {
            throw new ResourceNotFoundException("Lesson", "id", request.getLessonId());
        }
        if (readingContentRepository.findByLessonId(request.getLessonId()).isPresent()) {
            throw new ConflictException("Reading content already exists for this lesson; update it instead");
        }
        ReadingContent content = ReadingContent.builder()
                .title(request.getTitle())
                .contentHtml(request.getContentHtml())
                .contentMarkdown(request.getContentMarkdown())
                .estimatedReadingMinutes(request.getEstimatedReadingMinutes())
                .lessonId(request.getLessonId())
                .build();
        return toAdminReadingContentResponse(readingContentRepository.save(content));
    }

    @Override
    public AdminReadingContentResponse updateReadingContent(UUID id, UpdateAdminReadingContentRequest request) {
        ReadingContent content = readingContentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ReadingContent", "id", id));
        if (request.getTitle() != null) content.setTitle(request.getTitle());
        if (request.getContentHtml() != null) content.setContentHtml(request.getContentHtml());
        if (request.getContentMarkdown() != null) content.setContentMarkdown(request.getContentMarkdown());
        if (request.getEstimatedReadingMinutes() != null) content.setEstimatedReadingMinutes(request.getEstimatedReadingMinutes());
        return toAdminReadingContentResponse(readingContentRepository.save(content));
    }

    @Override
    public void deleteReadingContent(UUID id) {
        if (!readingContentRepository.existsById(id)) {
            throw new ResourceNotFoundException("ReadingContent", "id", id);
        }
        readingContentRepository.deleteById(id);
    }

    // =========================================================================
    // Quiz Builder
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<AdminQuizBuilderResponse> getCourseAssessments(UUID courseId) {
        return assessmentRepository.findByCourseId(courseId).stream()
                .map(this::toAdminQuizBuilderResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public AdminQuizBuilderResponse getAssessment(UUID id) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));
        return toAdminQuizBuilderResponse(assessment);
    }

    @Override
    public AdminQuizBuilderResponse createAssessment(CreateAdminAssessmentRequest request) {
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        Assessment assessment = Assessment.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .courseId(request.getCourseId())
                .type(parseAssessmentType(request.getAssessmentType()))
                .passingScore(request.getPassingScore())
                .timeLimitMinutes(request.getTimeLimitMinutes())
                .maxAttempts(request.getMaxAttempts())
                .build();
        assessment = assessmentRepository.save(assessment);

        if (request.getQuestions() != null) {
            saveQuestions(assessment.getId(), request.getQuestions());
        }

        return toAdminQuizBuilderResponse(assessment);
    }

    @Override
    public AdminQuizBuilderResponse updateAssessment(UUID id, UpdateAdminAssessmentRequest request) {
        Assessment assessment = assessmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assessment", "id", id));

        if (request.getQuestions() != null && assessmentResultRepository.existsByAssessmentId(id)) {
            throw new ConflictException(
                    "Cannot modify questions after learners have submitted results for this assessment; "
                            + "archive it and create a new version instead.");
        }

        if (request.getTitle() != null) assessment.setTitle(request.getTitle());
        if (request.getDescription() != null) assessment.setDescription(request.getDescription());
        if (request.getAssessmentType() != null) assessment.setType(parseAssessmentType(request.getAssessmentType()));
        if (request.getPassingScore() != null) assessment.setPassingScore(request.getPassingScore());
        if (request.getTimeLimitMinutes() != null) assessment.setTimeLimitMinutes(request.getTimeLimitMinutes());
        if (request.getMaxAttempts() != null) assessment.setMaxAttempts(request.getMaxAttempts());
        assessment = assessmentRepository.save(assessment);

        if (request.getQuestions() != null) {
            replaceQuestions(assessment.getId(), request.getQuestions());
        }

        return toAdminQuizBuilderResponse(assessment);
    }

    @Override
    public void deleteAssessment(UUID id) {
        if (!assessmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assessment", "id", id);
        }
        deleteQuestionsForAssessment(id);
        List<UUID> resultIds = assessmentResultRepository.findByAssessmentIdIn(List.of(id)).stream()
                .map(AssessmentResult::getId)
                .toList();
        if (!resultIds.isEmpty()) {
            answerRepository.deleteByResultIdIn(resultIds);
        }
        assessmentResultRepository.deleteByAssessmentIdIn(List.of(id));
        assessmentRepository.deleteById(id);
    }

    // =========================================================================
    // Lesson media uploads
    // =========================================================================

    @Override
    public AdminLessonResponse uploadLessonVideo(UUID lessonId, MultipartFile file) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        VideoRules rules = getOrCreateVideoRules();
        String extension = FileStorageService.extensionOf(file.getOriginalFilename());
        if (rules.getAllowedFormats() != null && !rules.getAllowedFormats().isEmpty()
                && rules.getAllowedFormats().stream().noneMatch(format -> format.equalsIgnoreCase(extension))) {
            throw new BadRequestException("Video format ." + extension + " is not allowed. Allowed formats: "
                    + String.join(", ", rules.getAllowedFormats()));
        }
        if (rules.getMaxFileSizeBytes() != null && file.getSize() > rules.getMaxFileSizeBytes()) {
            throw new BadRequestException("Video exceeds the maximum allowed size of "
                    + (rules.getMaxFileSizeBytes() / (1024 * 1024)) + " MB");
        }

        String url = fileStorageService.store(file, "videos");
        lesson.setContentUrl(url);
        return toAdminLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public AdminLessonResponse uploadLessonCaptions(UUID lessonId, MultipartFile file) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No captions file was uploaded");
        }
        String vttContent;
        try {
            vttContent = SubtitleConverter.toVtt(file.getBytes(), file.getOriginalFilename());
        } catch (IOException e) {
            throw new BadRequestException("Could not read captions file: " + e.getMessage());
        }

        String url = fileStorageService.storeText(vttContent, "captions", UUID.randomUUID() + ".vtt");
        lesson.setCaptionsUrl(url);
        return toAdminLessonResponse(lessonRepository.save(lesson));
    }

    @Override
    public AdminLessonResponse uploadLessonDocument(UUID lessonId, MultipartFile file) {
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ResourceNotFoundException("Lesson", "id", lessonId));

        String url = fileStorageService.store(file, "documents");
        lesson.setContentUrl(url);
        return toAdminLessonResponse(lessonRepository.save(lesson));
    }

    private void saveQuestions(UUID assessmentId, List<CreateAdminQuestionRequest> questions) {
        for (CreateAdminQuestionRequest questionRequest : questions) {
            Question question = Question.builder()
                    .questionText(questionRequest.getQuestionText())
                    .questionType(questionRequest.getQuestionType())
                    .points(questionRequest.getPoints())
                    .orderIndex(questionRequest.getOrderIndex())
                    .assessmentId(assessmentId)
                    .build();
            Question savedQuestion = questionRepository.save(question);

            if (questionRequest.getOptions() != null && !questionRequest.getOptions().isEmpty()) {
                List<QuestionOption> options = questionRequest.getOptions().stream()
                        .map(opt -> QuestionOption.builder()
                                .questionId(savedQuestion.getId())
                                .optionText(opt.getOptionText())
                                .correct(Boolean.TRUE.equals(opt.getCorrect()))
                                .build())
                        .toList();
                questionOptionRepository.saveAll(options);
            }
        }
    }

    private void replaceQuestions(UUID assessmentId, List<CreateAdminQuestionRequest> questions) {
        deleteQuestionsForAssessment(assessmentId);
        saveQuestions(assessmentId, questions);
    }

    private void deleteQuestionsForAssessment(UUID assessmentId) {
        List<Question> existingQuestions = questionRepository.findByAssessmentIdOrderByOrderIndex(assessmentId);
        for (Question question : existingQuestions) {
            questionOptionRepository.deleteAll(questionOptionRepository.findByQuestionId(question.getId()));
        }
        questionRepository.deleteAll(existingQuestions);
    }

    private AssessmentType parseAssessmentType(String value) {
        try {
            return AssessmentType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException("Invalid assessment type: " + value);
        }
    }

    // =========================================================================
    // Admin Account Management
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminAccountResponse> getAdmins(int page, int size) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 20 : size);
        Page<Account> accountPage = accountRepository.findByRoleIn(List.copyOf(ADMIN_TIER_ROLES), pageable);
        List<AdminAccountResponse> content = accountPage.getContent().stream()
                .map(this::toAdminAccountResponse)
                .toList();

        return PageResponse.<AdminAccountResponse>builder()
                .content(content)
                .page(accountPage.getNumber())
                .size(accountPage.getSize())
                .totalElements(accountPage.getTotalElements())
                .totalPages(accountPage.getTotalPages())
                .last(accountPage.isLast())
                .build();
    }

    @Override
    public AdminAccountResponse createAdmin(CreateAdminAccountRequest request, Principal principal) {
        if (!ADMIN_TIER_ROLES.contains(request.getRole())) {
            throw new BadRequestException("Role must be one of HR_ADMIN, ORGANIZATION_ADMIN, SUPER_ADMIN");
        }
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Email already registered");
        }
        if (request.getOrganizationId() != null && !organizationRepository.existsById(request.getOrganizationId())) {
            throw new BadRequestException("Organization not found");
        }

        Account account = Account.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .authProvider(AuthProvider.LOCAL)
                .emailVerified(true)
                .active(true)
                .organizationId(request.getOrganizationId())
                .build();
        Account savedAccount = accountRepository.save(account);

        User savedUser = userRepository.save(User.builder()
                .fullName(request.getFullName())
                .accountId(savedAccount.getId())
                .build());

        savedAccount.setUserId(savedUser.getId());
        savedAccount = accountRepository.save(savedAccount);

        recordAudit(authContext.currentUserId(principal), "CREATE_ADMIN", "ACCOUNT", savedAccount.getId(),
                "Created admin account " + savedAccount.getEmail() + " with role " + savedAccount.getRole());

        return toAdminAccountResponse(savedAccount, savedUser.getFullName());
    }

    @Override
    public AdminAccountResponse updateAdminRole(UUID id, UpdateAdminAccountRoleRequest request, Principal principal) {
        if (!ADMIN_TIER_ROLES.contains(request.getRole())) {
            throw new BadRequestException("Role must be one of HR_ADMIN, ORGANIZATION_ADMIN, SUPER_ADMIN");
        }
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account", "id", id));
        account.setRole(request.getRole());
        Account saved = accountRepository.save(account);

        recordAudit(authContext.currentUserId(principal), "UPDATE_ADMIN_ROLE", "ACCOUNT", saved.getId(),
                "Changed role to " + saved.getRole());

        return toAdminAccountResponse(saved);
    }

    @Override
    public void deactivateAdmin(UUID id, Principal principal) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Admin account", "id", id));
        UUID actorUserId = authContext.currentUserId(principal);
        if (account.getUserId() != null && account.getUserId().equals(actorUserId)) {
            throw new BadRequestException("You cannot deactivate your own admin account");
        }
        account.setActive(false);
        accountRepository.save(account);

        recordAudit(actorUserId, "DEACTIVATE_ADMIN", "ACCOUNT", account.getId(),
                "Deactivated admin account " + account.getEmail());
    }

    // =========================================================================
    // Audit Log
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AuditLogResponse> getAuditLogs(int page, int size, String entityType, UUID userId) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 20 : size);
        Page<AuditLog> logPage;
        if (StringUtils.hasText(entityType)) {
            logPage = auditLogRepository.findByEntityTypeOrderByCreatedAtDesc(entityType, pageable);
        } else if (userId != null) {
            logPage = auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        } else {
            logPage = auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<AuditLogResponse> content = logPage.getContent().stream()
                .map(this::toAuditLogResponse)
                .toList();

        return PageResponse.<AuditLogResponse>builder()
                .content(content)
                .page(logPage.getNumber())
                .size(logPage.getSize())
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .last(logPage.isLast())
                .build();
    }

    // =========================================================================
    // Assignment grading
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> getLessonSubmissions(UUID lessonId) {
        return assignmentService.getSubmissionsForLesson(lessonId);
    }

    @Override
    public AssignmentSubmissionResponse gradeSubmission(UUID submissionId, GradeSubmissionRequest request, Principal principal) {
        UUID graderId = authContext.currentUserId(principal);
        AssignmentSubmissionResponse response = assignmentService.gradeSubmission(submissionId, graderId, request);
        recordAudit(graderId, "GRADE_SUBMISSION", "ASSIGNMENT_SUBMISSION", submissionId,
                "Graded submission with score " + request.getScore());
        return response;
    }

    // =========================================================================
    // Contests
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public List<ContestResponse> getContests(UUID courseId) {
        return contestService.listContests(courseId);
    }

    @Override
    public ContestResponse createContest(CreateContestRequest request, Principal principal) {
        UUID actorId = authContext.currentUserId(principal);
        ContestResponse response = contestService.createContest(request, actorId);
        recordAudit(actorId, "CREATE_CONTEST", "CONTEST", response.getId(), "Created contest: " + response.getTitle());
        return response;
    }

    @Override
    public void deleteContest(UUID id, Principal principal) {
        contestService.deleteContest(id);
        recordAudit(authContext.currentUserId(principal), "DELETE_CONTEST", "CONTEST", id, "Deleted contest");
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getContestLeaderboard(UUID contestId) {
        return contestService.getLeaderboard(contestId);
    }

    // =========================================================================
    // Learners directory
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminLearnerResponse> getLearners(int page, int size, String search, Principal principal) {
        Pageable pageable = PageRequest.of(Math.max(page, 0), size <= 0 ? 20 : size);
        Account caller = authContext.currentAccount(principal);

        Page<User> userPage;
        if (caller.getRole() != Role.SUPER_ADMIN && caller.getOrganizationId() != null) {
            // Org-scoped admin: the learner directory is otherwise platform-wide, so an
            // organization_id being set on this admin's own account is what turns this
            // filtering on - see OrganizationScope.
            List<UUID> orgUserIds = employeeRepository.findByOrganizationId(caller.getOrganizationId()).stream()
                    .map(Employee::getUserId)
                    .toList();
            userPage = StringUtils.hasText(search)
                    ? userRepository.findByIdInAndFullNameContainingIgnoreCase(orgUserIds, search, pageable)
                    : userRepository.findByIdIn(orgUserIds, pageable);
        } else {
            userPage = StringUtils.hasText(search)
                    ? userRepository.findByFullNameContainingIgnoreCase(search, pageable)
                    : userRepository.findAll(pageable);
        }

        List<AdminLearnerResponse> content = userPage.getContent().stream()
                .map(user -> {
                    Account account = user.getAccountId() == null ? null
                            : accountRepository.findById(user.getAccountId()).orElse(null);
                    return AdminLearnerResponse.builder()
                            .userId(user.getId())
                            .fullName(user.getFullName())
                            .email(account == null ? null : account.getEmail())
                            .learnerCode(user.getLearnerCode())
                            .role(account == null || account.getRole() == null ? null : account.getRole().name())
                            .active(account == null || account.isActive())
                            .createdAt(user.getCreatedAt())
                            .build();
                })
                .toList();

        return PageResponse.<AdminLearnerResponse>builder()
                .content(content)
                .page(userPage.getNumber())
                .size(userPage.getSize())
                .totalElements(userPage.getTotalElements())
                .totalPages(userPage.getTotalPages())
                .last(userPage.isLast())
                .build();
    }

    private void recordAudit(UUID actorUserId, String action, String entityType, UUID entityId, String details) {
        auditLogRepository.save(AuditLog.builder()
                .userId(actorUserId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .details(details)
                .build());
    }

    // =========================================================================
    // Mapping helpers
    // =========================================================================

    private List<AdminCourseListResponse> toAdminCourseResponses(List<Course> courses) {
        Set<UUID> categoryIds = courses.stream().map(Course::getCategoryId).filter(Objects::nonNull).collect(Collectors.toSet());
        Set<UUID> instructorIds = courses.stream().map(Course::getInstructorId).filter(Objects::nonNull).collect(Collectors.toSet());

        Map<UUID, String> categoryNames = categoryIds.isEmpty()
                ? Map.of()
                : categoryRepository.findAllById(categoryIds).stream()
                        .collect(Collectors.toMap(Category::getId, Category::getName));
        Map<UUID, String> instructorNames = instructorIds.isEmpty()
                ? Map.of()
                : userRepository.findAllById(instructorIds).stream()
                        .collect(Collectors.toMap(User::getId, User::getFullName));

        return courses.stream()
                .map(course -> toAdminCourseResponse(course,
                        course.getCategoryId() == null ? null : categoryNames.get(course.getCategoryId()),
                        course.getInstructorId() == null ? null : instructorNames.get(course.getInstructorId())))
                .toList();
    }

    private AdminCourseListResponse toAdminCourseResponse(Course course) {
        String categoryName = course.getCategoryId() == null ? null
                : categoryRepository.findById(course.getCategoryId()).map(Category::getName).orElse(null);
        String instructorName = course.getInstructorId() == null ? null
                : userRepository.findById(course.getInstructorId()).map(User::getFullName).orElse(null);
        return toAdminCourseResponse(course, categoryName, instructorName);
    }

    private AdminCourseListResponse toAdminCourseResponse(Course course, String categoryName, String instructorName) {
        return AdminCourseListResponse.builder()
                .id(course.getId().toString())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .instructorName(instructorName)
                .categoryName(categoryName)
                .visibility(course.getVisibility() == null ? null : course.getVisibility().name())
                .status(course.getStatus() == null ? null : course.getStatus().name())
                .durationHours(course.getDurationHours())
                .price(course.getPrice())
                .rating(course.getRating())
                .totalEnrollments(course.getTotalEnrollments())
                .createdAt(course.getCreatedAt())
                .updatedAt(course.getUpdatedAt())
                .build();
    }

    private AdminModuleResponse toAdminModuleResponse(CourseModule module) {
        List<AdminLessonResponse> lessons = lessonRepository.findByModuleIdOrderByOrderIndex(module.getId()).stream()
                .map(this::toAdminLessonResponse)
                .toList();
        return toAdminModuleResponse(module, lessons);
    }

    private AdminModuleResponse toAdminModuleResponse(CourseModule module, List<AdminLessonResponse> lessons) {
        return AdminModuleResponse.builder()
                .id(module.getId().toString())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .courseId(module.getCourseId() == null ? null : module.getCourseId().toString())
                .createdAt(module.getCreatedAt())
                .updatedAt(module.getUpdatedAt())
                .lessons(lessons)
                .build();
    }

    private AdminLessonResponse toAdminLessonResponse(Lesson lesson) {
        return AdminLessonResponse.builder()
                .id(lesson.getId().toString())
                .title(lesson.getTitle())
                .description(lesson.getDescription())
                .contentUrl(lesson.getContentUrl())
                .captionsUrl(lesson.getCaptionsUrl())
                .contentType(lesson.getContentType())
                .durationMinutes(lesson.getDurationMinutes())
                .orderIndex(lesson.getOrderIndex())
                .moduleId(lesson.getModuleId() == null ? null : lesson.getModuleId().toString())
                .createdAt(lesson.getCreatedAt())
                .updatedAt(lesson.getUpdatedAt())
                .build();
    }

    private AdminVideoRulesResponse toAdminVideoRulesResponse(VideoRules rules) {
        return AdminVideoRulesResponse.builder()
                .id(rules.getId().toString())
                .allowedFormats(rules.getAllowedFormats())
                .maxFileSizeBytes(rules.getMaxFileSizeBytes())
                .maxDurationMinutes(rules.getMaxDurationMinutes())
                .allowedCodecs(rules.getAllowedCodecs())
                .defaultEncodingProfile(rules.getDefaultEncodingProfile())
                .requireTranscoding(rules.getRequireTranscoding())
                .autoGenerateThumbnails(rules.getAutoGenerateThumbnails())
                .createdAt(rules.getCreatedAt())
                .updatedAt(rules.getUpdatedAt())
                .build();
    }

    private AdminReadingContentResponse toAdminReadingContentResponse(ReadingContent content) {
        return AdminReadingContentResponse.builder()
                .id(content.getId().toString())
                .title(content.getTitle())
                .contentHtml(content.getContentHtml())
                .contentMarkdown(content.getContentMarkdown())
                .estimatedReadingMinutes(content.getEstimatedReadingMinutes())
                .lessonId(content.getLessonId() == null ? null : content.getLessonId().toString())
                .createdAt(content.getCreatedAt())
                .updatedAt(content.getUpdatedAt())
                .build();
    }

    private AdminQuizBuilderResponse toAdminQuizBuilderResponse(Assessment assessment) {
        List<Question> questions = questionRepository.findByAssessmentIdOrderByOrderIndex(assessment.getId());
        List<AdminQuestionResponse> questionResponses = questions.stream()
                .map(this::toAdminQuestionResponse)
                .toList();
        return AdminQuizBuilderResponse.builder()
                .id(assessment.getId().toString())
                .title(assessment.getTitle())
                .description(assessment.getDescription())
                .courseId(assessment.getCourseId() == null ? null : assessment.getCourseId().toString())
                .assessmentType(assessment.getType() == null ? null : assessment.getType().name())
                .passingScore(assessment.getPassingScore())
                .timeLimitMinutes(assessment.getTimeLimitMinutes())
                .maxAttempts(assessment.getMaxAttempts())
                .createdAt(assessment.getCreatedAt())
                .updatedAt(assessment.getUpdatedAt())
                .questions(questionResponses)
                .build();
    }

    private AdminQuestionResponse toAdminQuestionResponse(Question question) {
        List<AdminQuestionOptionResponse> options = questionOptionRepository.findByQuestionId(question.getId()).stream()
                .map(this::toAdminQuestionOptionResponse)
                .toList();
        return AdminQuestionResponse.builder()
                .id(question.getId().toString())
                .questionText(question.getQuestionText())
                .questionType(question.getQuestionType())
                .points(question.getPoints())
                .orderIndex(question.getOrderIndex())
                .assessmentId(question.getAssessmentId() == null ? null : question.getAssessmentId().toString())
                .createdAt(question.getCreatedAt())
                .updatedAt(question.getUpdatedAt())
                .options(options)
                .build();
    }

    private AdminQuestionOptionResponse toAdminQuestionOptionResponse(QuestionOption option) {
        return AdminQuestionOptionResponse.builder()
                .id(option.getId().toString())
                .optionText(option.getOptionText())
                .correct(option.isCorrect())
                .orderIndex(null)
                .createdAt(option.getCreatedAt())
                .build();
    }

    private AdminAccountResponse toAdminAccountResponse(Account account) {
        String fullName = account.getUserId() == null ? null
                : userRepository.findById(account.getUserId()).map(User::getFullName).orElse(null);
        return toAdminAccountResponse(account, fullName);
    }

    private AdminAccountResponse toAdminAccountResponse(Account account, String fullName) {
        return AdminAccountResponse.builder()
                .id(account.getId())
                .userId(account.getUserId())
                .fullName(fullName)
                .email(account.getEmail())
                .role(account.getRole())
                .active(account.isActive())
                .organizationId(account.getOrganizationId())
                .createdAt(account.getCreatedAt())
                .build();
    }

    private AuditLogResponse toAuditLogResponse(AuditLog log) {
        String actorName = log.getUserId() == null ? null
                : userRepository.findById(log.getUserId()).map(User::getFullName).orElse(null);
        return AuditLogResponse.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .actorName(actorName)
                .action(log.getAction())
                .entityType(log.getEntityType())
                .entityId(log.getEntityId() == null ? null : log.getEntityId().toString())
                .details(log.getDetails())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private <E extends Enum<E>> E parseEnumOrNull(Class<E> enumType, String value) {
        if (!StringUtils.hasText(value)) return null;
        try {
            return Enum.valueOf(enumType, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid value '" + value + "' for " + enumType.getSimpleName());
        }
    }

    private UUID parseUuid(String value, String fieldLabel) {
        try {
            return UUID.fromString(value);
        } catch (IllegalArgumentException | NullPointerException ex) {
            throw new BadRequestException("Invalid " + fieldLabel + ": " + value);
        }
    }
}
