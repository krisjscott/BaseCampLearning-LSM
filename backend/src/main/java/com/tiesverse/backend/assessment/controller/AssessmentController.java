package com.tiesverse.backend.assessment.controller;

import com.tiesverse.backend.assessment.dto.request.CreateAssessmentRequest;
import com.tiesverse.backend.assessment.dto.request.CreateQuestionRequest;
import com.tiesverse.backend.assessment.dto.request.SubmitAssessmentRequest;
import com.tiesverse.backend.assessment.dto.response.AssessmentResponse;
import com.tiesverse.backend.assessment.dto.response.AssessmentResultResponse;
import com.tiesverse.backend.assessment.dto.response.QuestionResponse;
import com.tiesverse.backend.assessment.service.AssessmentService;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.security.AuthContext;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assessments")
@RequiredArgsConstructor
public class AssessmentController {

    private final AssessmentService assessmentService;
    private final AuthContext authContext;

    @PostMapping
    public ApiResponse<AssessmentResponse> createAssessment(@Valid @RequestBody CreateAssessmentRequest request) {
        return ApiResponse.success("Assessment created", assessmentService.createAssessment(request));
    }

    @GetMapping("/{id}")
    public ApiResponse<AssessmentResponse> getAssessment(@PathVariable UUID id) {
        return ApiResponse.success(assessmentService.getAssessment(id));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<List<AssessmentResponse>> getAssessmentsByCourse(@PathVariable UUID courseId) {
        return ApiResponse.success(assessmentService.getAssessmentsByCourse(courseId));
    }

    @PutMapping("/{id}")
    public ApiResponse<AssessmentResponse> updateAssessment(
            @PathVariable UUID id,
            @Valid @RequestBody CreateAssessmentRequest request) {
        return ApiResponse.success("Assessment updated", assessmentService.updateAssessment(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteAssessment(@PathVariable UUID id) {
        assessmentService.deleteAssessment(id);
        return ApiResponse.success("Assessment deleted", null);
    }

    @PostMapping("/{assessmentId}/questions")
    public ApiResponse<QuestionResponse> createQuestion(
            @PathVariable UUID assessmentId,
            @Valid @RequestBody CreateQuestionRequest request) {
        return ApiResponse.success("Question created", assessmentService.createQuestion(assessmentId, request));
    }

    @PutMapping("/questions/{questionId}")
    public ApiResponse<QuestionResponse> updateQuestion(
            @PathVariable UUID questionId,
            @Valid @RequestBody CreateQuestionRequest request) {
        return ApiResponse.success("Question updated", assessmentService.updateQuestion(questionId, request));
    }

    @DeleteMapping("/questions/{questionId}")
    public ApiResponse<Void> deleteQuestion(@PathVariable UUID questionId) {
        assessmentService.deleteQuestion(questionId);
        return ApiResponse.success("Question deleted", null);
    }

    @PostMapping("/submit")
    public ApiResponse<AssessmentResultResponse> submitAssessment(
            Principal principal,
            @Valid @RequestBody SubmitAssessmentRequest request) {
        return ApiResponse.success("Assessment submitted", assessmentService.submitAssessment(authContext.currentUserId(principal), request));
    }

    @GetMapping("/results/{resultId}")
    public ApiResponse<AssessmentResultResponse> getResult(Principal principal, @PathVariable UUID resultId) {
        return ApiResponse.success(assessmentService.getResult(resultId, authContext.currentAccount(principal)));
    }

    @GetMapping("/results")
    public ApiResponse<List<AssessmentResultResponse>> getResultHistory(
            Principal principal,
            @RequestParam UUID userId,
            @RequestParam UUID assessmentId) {
        authContext.requireSelfOrAdmin(principal, userId);
        return ApiResponse.success(assessmentService.getResultHistory(userId, assessmentId));
    }
}
