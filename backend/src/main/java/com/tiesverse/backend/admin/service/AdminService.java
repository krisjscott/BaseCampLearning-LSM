package com.tiesverse.backend.admin.service;

import com.tiesverse.backend.admin.dto.response.AdminDashboardStatsResponse;
import com.tiesverse.backend.admin.dto.response.AdminCourseListResponse;
import com.tiesverse.backend.admin.dto.response.AdminModuleResponse;
import com.tiesverse.backend.admin.dto.response.AdminLessonResponse;
import com.tiesverse.backend.admin.dto.response.AdminVideoRulesResponse;
import com.tiesverse.backend.admin.dto.response.AdminReadingContentResponse;
import com.tiesverse.backend.admin.dto.response.AdminQuizBuilderResponse;
import com.tiesverse.backend.admin.dto.request.CreateAdminCourseRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminCourseRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminModuleRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminLessonRequest;
import com.tiesverse.backend.admin.dto.request.ReorderModulesRequest;
import com.tiesverse.backend.admin.dto.request.ReorderLessonsRequest;
import com.tiesverse.backend.admin.dto.request.UpdateVideoRulesRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminReadingContentRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminReadingContentRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminAssessmentRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminAssessmentRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminModuleRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminLessonRequest;
import com.tiesverse.backend.admin.dto.request.CreateAdminAccountRequest;
import com.tiesverse.backend.admin.dto.request.UpdateAdminAccountRoleRequest;
import com.tiesverse.backend.admin.dto.response.AdminAccountResponse;
import com.tiesverse.backend.admin.dto.response.AdminLearnerResponse;
import com.tiesverse.backend.admin.dto.response.AuditLogResponse;
import com.tiesverse.backend.assignment.dto.request.GradeSubmissionRequest;
import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import com.tiesverse.backend.contest.dto.request.CreateContestRequest;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;
import com.tiesverse.backend.common.response.PageResponse;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

public interface AdminService {

    // Dashboard
    AdminDashboardStatsResponse getDashboardStats();

    // Course Management
    PageResponse<AdminCourseListResponse> getCourses(int page, int size, String search, String status, String visibility);
    AdminCourseListResponse getCourse(UUID id);
    AdminCourseListResponse createCourse(CreateAdminCourseRequest request, Principal principal);
    AdminCourseListResponse updateCourse(UUID id, UpdateAdminCourseRequest request);
    void deleteCourse(UUID id, Principal principal);
    AdminCourseListResponse publishCourse(UUID id, Principal principal);
    AdminCourseListResponse archiveCourse(UUID id, Principal principal);

    // Curriculum Builder - Modules
    List<AdminModuleResponse> getCourseModules(UUID courseId);
    AdminModuleResponse getModule(UUID id);
    AdminModuleResponse createModule(CreateAdminModuleRequest request);
    AdminModuleResponse updateModule(UUID id, UpdateAdminModuleRequest request);
    void deleteModule(UUID id);
    void reorderModules(UUID courseId, ReorderModulesRequest request);

    // Curriculum Builder - Lessons
    List<AdminLessonResponse> getModuleLessons(UUID moduleId);
    AdminLessonResponse getLesson(UUID id);
    AdminLessonResponse createLesson(CreateAdminLessonRequest request);
    AdminLessonResponse updateLesson(UUID id, UpdateAdminLessonRequest request);
    void deleteLesson(UUID id);
    void reorderLessons(UUID moduleId, ReorderLessonsRequest request);
    AdminLessonResponse uploadLessonVideo(UUID lessonId, MultipartFile file);
    AdminLessonResponse uploadLessonCaptions(UUID lessonId, MultipartFile file);

    AdminLessonResponse uploadLessonDocument(UUID lessonId, MultipartFile file);

    // Video Rules
    AdminVideoRulesResponse getVideoRules();
    AdminVideoRulesResponse updateVideoRules(UpdateVideoRulesRequest request, Principal principal);

    // Reading Content
    AdminReadingContentResponse getReadingContent(UUID lessonId);
    AdminReadingContentResponse createReadingContent(CreateAdminReadingContentRequest request);
    AdminReadingContentResponse updateReadingContent(UUID id, UpdateAdminReadingContentRequest request);
    void deleteReadingContent(UUID id);

    // Quiz Builder
    List<AdminQuizBuilderResponse> getCourseAssessments(UUID courseId);
    AdminQuizBuilderResponse getAssessment(UUID id);
    AdminQuizBuilderResponse createAssessment(CreateAdminAssessmentRequest request);
    AdminQuizBuilderResponse updateAssessment(UUID id, UpdateAdminAssessmentRequest request);
    void deleteAssessment(UUID id);

    // Admin Account Management
    PageResponse<AdminAccountResponse> getAdmins(int page, int size);
    AdminAccountResponse createAdmin(CreateAdminAccountRequest request, Principal principal);
    AdminAccountResponse updateAdminRole(UUID id, UpdateAdminAccountRoleRequest request, Principal principal);
    void deactivateAdmin(UUID id, Principal principal);

    // Audit Log
    PageResponse<AuditLogResponse> getAuditLogs(int page, int size, String entityType, UUID userId);

    // Assignment grading
    List<AssignmentSubmissionResponse> getLessonSubmissions(UUID lessonId);
    AssignmentSubmissionResponse gradeSubmission(UUID submissionId, GradeSubmissionRequest request, Principal principal);

    // Contests
    List<ContestResponse> getContests(UUID courseId);
    ContestResponse createContest(CreateContestRequest request, Principal principal);
    void deleteContest(UUID id, Principal principal);
    List<LeaderboardEntryResponse> getContestLeaderboard(UUID contestId);

    // Learners directory (organization-independent)
    PageResponse<AdminLearnerResponse> getLearners(int page, int size, String search, Principal principal);
}