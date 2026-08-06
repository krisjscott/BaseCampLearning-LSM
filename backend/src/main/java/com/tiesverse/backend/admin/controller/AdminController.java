package com.tiesverse.backend.admin.controller;

import com.tiesverse.backend.admin.dto.request.CreateAdminAccountRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminAssessmentRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminCourseRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminLessonRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminModuleRequest;
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
import com.tiesverse.backend.admin.dto.response.AdminQuizBuilderResponse;
import com.tiesverse.backend.admin.dto.response.AdminReadingContentResponse;
import com.tiesverse.backend.admin.dto.response.AdminVideoRulesResponse;
import com.tiesverse.backend.admin.dto.response.AuditLogResponse;
import com.tiesverse.backend.admin.service.AdminService;
import com.tiesverse.backend.assignment.dto.request.GradeSubmissionRequest;
import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import com.tiesverse.backend.contest.dto.request.CreateContestRequest;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.common.response.PageResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

/**
 * Admin-only backend API surface, separate from the shared learner-facing
 * controllers under /api/v1/courses, /api/v1/assessments, etc. Access is
 * restricted to TRAINER/HR_ADMIN/ORGANIZATION_ADMIN/SUPER_ADMIN roles - see
 * SecurityConfig.
 */
@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // =========================================================================
    // Dashboard
    // =========================================================================

    @GetMapping("/dashboard")
    public ApiResponse<AdminDashboardStatsResponse> getDashboardStats() {
        return ApiResponse.success(adminService.getDashboardStats());
    }

    // =========================================================================
    // Course Management
    // =========================================================================

    @GetMapping("/courses")
    public ApiResponse<PageResponse<AdminCourseListResponse>> getCourses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String visibility) {
        return ApiResponse.success(adminService.getCourses(page, size, search, status, visibility));
    }

    @GetMapping("/courses/{id}")
    public ApiResponse<AdminCourseListResponse> getCourse(@PathVariable UUID id) {
        return ApiResponse.success(adminService.getCourse(id));
    }

    @PostMapping("/courses")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminCourseListResponse> createCourse(@Valid @RequestBody CreateAdminCourseRequest request,
                                                                Principal principal) {
        return ApiResponse.success("Course created", adminService.createCourse(request, principal));
    }

    @PutMapping("/courses/{id}")
    public ApiResponse<AdminCourseListResponse> updateCourse(@PathVariable UUID id,
                                                               @Valid @RequestBody UpdateAdminCourseRequest request) {
        return ApiResponse.success("Course updated", adminService.updateCourse(id, request));
    }

    @DeleteMapping("/courses/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteCourse(@PathVariable UUID id, Principal principal) {
        adminService.deleteCourse(id, principal);
        return ApiResponse.success("Course deleted", null);
    }

    @PostMapping("/courses/{id}/publish")
    public ApiResponse<AdminCourseListResponse> publishCourse(@PathVariable UUID id, Principal principal) {
        return ApiResponse.success("Course published", adminService.publishCourse(id, principal));
    }

    @PostMapping("/courses/{id}/archive")
    public ApiResponse<AdminCourseListResponse> archiveCourse(@PathVariable UUID id, Principal principal) {
        return ApiResponse.success("Course archived", adminService.archiveCourse(id, principal));
    }

    // =========================================================================
    // Curriculum Builder - Modules
    // =========================================================================

    @GetMapping("/courses/{courseId}/modules")
    public ApiResponse<List<AdminModuleResponse>> getCourseModules(@PathVariable UUID courseId) {
        return ApiResponse.success(adminService.getCourseModules(courseId));
    }

    @GetMapping("/modules/{id}")
    public ApiResponse<AdminModuleResponse> getModule(@PathVariable UUID id) {
        return ApiResponse.success(adminService.getModule(id));
    }

    @PostMapping("/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminModuleResponse> createModule(@Valid @RequestBody CreateAdminModuleRequest request) {
        return ApiResponse.success("Module created", adminService.createModule(request));
    }

    @PutMapping("/modules/{id}")
    public ApiResponse<AdminModuleResponse> updateModule(@PathVariable UUID id,
                                                           @Valid @RequestBody UpdateAdminModuleRequest request) {
        return ApiResponse.success("Module updated", adminService.updateModule(id, request));
    }

    @DeleteMapping("/modules/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteModule(@PathVariable UUID id) {
        adminService.deleteModule(id);
        return ApiResponse.success("Module deleted", null);
    }

    @PutMapping("/courses/{courseId}/modules/reorder")
    public ApiResponse<Void> reorderModules(@PathVariable UUID courseId, @RequestBody ReorderModulesRequest request) {
        adminService.reorderModules(courseId, request);
        return ApiResponse.success("Modules reordered", null);
    }

    // =========================================================================
    // Curriculum Builder - Lessons
    // =========================================================================

    @GetMapping("/modules/{moduleId}/lessons")
    public ApiResponse<List<AdminLessonResponse>> getModuleLessons(@PathVariable UUID moduleId) {
        return ApiResponse.success(adminService.getModuleLessons(moduleId));
    }

    @GetMapping("/lessons/{id}")
    public ApiResponse<AdminLessonResponse> getLesson(@PathVariable UUID id) {
        return ApiResponse.success(adminService.getLesson(id));
    }

    @PostMapping("/lessons")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminLessonResponse> createLesson(@Valid @RequestBody CreateAdminLessonRequest request) {
        return ApiResponse.success("Lesson created", adminService.createLesson(request));
    }

    @PutMapping("/lessons/{id}")
    public ApiResponse<AdminLessonResponse> updateLesson(@PathVariable UUID id,
                                                           @Valid @RequestBody UpdateAdminLessonRequest request) {
        return ApiResponse.success("Lesson updated", adminService.updateLesson(id, request));
    }

    @DeleteMapping("/lessons/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteLesson(@PathVariable UUID id) {
        adminService.deleteLesson(id);
        return ApiResponse.success("Lesson deleted", null);
    }

    @PutMapping("/modules/{moduleId}/lessons/reorder")
    public ApiResponse<Void> reorderLessons(@PathVariable UUID moduleId, @RequestBody ReorderLessonsRequest request) {
        adminService.reorderLessons(moduleId, request);
        return ApiResponse.success("Lessons reordered", null);
    }

    @PostMapping("/lessons/{id}/video")
    public ApiResponse<AdminLessonResponse> uploadLessonVideo(@PathVariable UUID id,
                                                                @RequestPart("file") MultipartFile file) {
        return ApiResponse.success("Video uploaded", adminService.uploadLessonVideo(id, file));
    }

    @PostMapping("/lessons/{id}/captions")
    public ApiResponse<AdminLessonResponse> uploadLessonCaptions(@PathVariable UUID id,
                                                                    @RequestPart("file") MultipartFile file) {
        return ApiResponse.success("Captions uploaded", adminService.uploadLessonCaptions(id, file));
    }

    @PostMapping("/lessons/{id}/document")
    public ApiResponse<AdminLessonResponse> uploadLessonDocument(@PathVariable UUID id,
                                                                    @RequestPart("file") MultipartFile file) {
        return ApiResponse.success("Document uploaded", adminService.uploadLessonDocument(id, file));
    }

    // =========================================================================
    // Video Rules
    // =========================================================================

    @GetMapping("/video-rules")
    public ApiResponse<AdminVideoRulesResponse> getVideoRules() {
        return ApiResponse.success(adminService.getVideoRules());
    }

    @PutMapping("/video-rules")
    public ApiResponse<AdminVideoRulesResponse> updateVideoRules(@Valid @RequestBody UpdateVideoRulesRequest request,
                                                                    Principal principal) {
        return ApiResponse.success("Video rules updated", adminService.updateVideoRules(request, principal));
    }

    // =========================================================================
    // Reading Content
    // =========================================================================

    @GetMapping("/reading-content/{lessonId}")
    public ApiResponse<AdminReadingContentResponse> getReadingContent(@PathVariable UUID lessonId) {
        return ApiResponse.success(adminService.getReadingContent(lessonId));
    }

    @PostMapping("/reading-content")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminReadingContentResponse> createReadingContent(@Valid @RequestBody CreateAdminReadingContentRequest request) {
        return ApiResponse.success("Reading content created", adminService.createReadingContent(request));
    }

    @PutMapping("/reading-content/{id}")
    public ApiResponse<AdminReadingContentResponse> updateReadingContent(@PathVariable UUID id,
                                                                           @Valid @RequestBody UpdateAdminReadingContentRequest request) {
        return ApiResponse.success("Reading content updated", adminService.updateReadingContent(id, request));
    }

    @DeleteMapping("/reading-content/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteReadingContent(@PathVariable UUID id) {
        adminService.deleteReadingContent(id);
        return ApiResponse.success("Reading content deleted", null);
    }

    // =========================================================================
    // Quiz Builder
    // =========================================================================

    @GetMapping("/courses/{courseId}/assessments")
    public ApiResponse<List<AdminQuizBuilderResponse>> getCourseAssessments(@PathVariable UUID courseId) {
        return ApiResponse.success(adminService.getCourseAssessments(courseId));
    }

    @GetMapping("/assessments/{id}")
    public ApiResponse<AdminQuizBuilderResponse> getAssessment(@PathVariable UUID id) {
        return ApiResponse.success(adminService.getAssessment(id));
    }

    @PostMapping("/assessments")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminQuizBuilderResponse> createAssessment(@Valid @RequestBody CreateAdminAssessmentRequest request) {
        return ApiResponse.success("Assessment created", adminService.createAssessment(request));
    }

    @PutMapping("/assessments/{id}")
    public ApiResponse<AdminQuizBuilderResponse> updateAssessment(@PathVariable UUID id,
                                                                    @Valid @RequestBody UpdateAdminAssessmentRequest request) {
        return ApiResponse.success("Assessment updated", adminService.updateAssessment(id, request));
    }

    @DeleteMapping("/assessments/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteAssessment(@PathVariable UUID id) {
        adminService.deleteAssessment(id);
        return ApiResponse.success("Assessment deleted", null);
    }

    // =========================================================================
    // Admin Account Management
    // =========================================================================

    @GetMapping("/admins")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ApiResponse<PageResponse<AdminAccountResponse>> getAdmins(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.success(adminService.getAdmins(page, size));
    }

    @PostMapping("/admins")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<AdminAccountResponse> createAdmin(@Valid @RequestBody CreateAdminAccountRequest request,
                                                            Principal principal) {
        return ApiResponse.success("Admin account created", adminService.createAdmin(request, principal));
    }

    @PutMapping("/admins/{id}/role")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<AdminAccountResponse> updateAdminRole(@PathVariable UUID id,
                                                                @Valid @RequestBody UpdateAdminAccountRoleRequest request,
                                                                Principal principal) {
        return ApiResponse.success("Admin role updated", adminService.updateAdminRole(id, request, principal));
    }

    @DeleteMapping("/admins/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ApiResponse<Void> deactivateAdmin(@PathVariable UUID id, Principal principal) {
        adminService.deactivateAdmin(id, principal);
        return ApiResponse.success("Admin account deactivated", null);
    }

    // =========================================================================
    // Audit Log
    // =========================================================================

    @GetMapping("/audit-logs")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ORGANIZATION_ADMIN')")
    public ApiResponse<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) UUID userId) {
        return ApiResponse.success(adminService.getAuditLogs(page, size, entityType, userId));
    }

    // =========================================================================
    // Assignment grading
    // =========================================================================

    @GetMapping("/lessons/{lessonId}/submissions")
    public ApiResponse<List<AssignmentSubmissionResponse>> getLessonSubmissions(@PathVariable UUID lessonId) {
        return ApiResponse.success(adminService.getLessonSubmissions(lessonId));
    }

    @PutMapping("/submissions/{id}/grade")
    public ApiResponse<AssignmentSubmissionResponse> gradeSubmission(@PathVariable UUID id,
                                                                        @Valid @RequestBody GradeSubmissionRequest request,
                                                                        Principal principal) {
        return ApiResponse.success("Submission graded", adminService.gradeSubmission(id, request, principal));
    }

    // =========================================================================
    // Contests
    // =========================================================================

    @GetMapping("/contests")
    public ApiResponse<List<ContestResponse>> getContests(@RequestParam(required = false) UUID courseId) {
        return ApiResponse.success(adminService.getContests(courseId));
    }

    @PostMapping("/contests")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ContestResponse> createContest(@Valid @RequestBody CreateContestRequest request, Principal principal) {
        return ApiResponse.success("Contest created", adminService.createContest(request, principal));
    }

    @DeleteMapping("/contests/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public ApiResponse<Void> deleteContest(@PathVariable UUID id, Principal principal) {
        adminService.deleteContest(id, principal);
        return ApiResponse.success("Contest deleted", null);
    }

    @GetMapping("/contests/{id}/leaderboard")
    public ApiResponse<List<LeaderboardEntryResponse>> getContestLeaderboard(@PathVariable UUID id) {
        return ApiResponse.success(adminService.getContestLeaderboard(id));
    }

    // =========================================================================
    // Learners directory
    // =========================================================================

    @GetMapping("/learners")
    public ApiResponse<PageResponse<AdminLearnerResponse>> getLearners(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search) {
        return ApiResponse.success(adminService.getLearners(page, size, search));
    }
}
