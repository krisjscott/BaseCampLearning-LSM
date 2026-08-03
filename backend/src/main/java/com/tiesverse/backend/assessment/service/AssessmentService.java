package com.tiesverse.backend.assessment.service;

import com.tiesverse.backend.assessment.dto.request.CreateAssessmentRequest;
import com.tiesverse.backend.assessment.dto.request.CreateQuestionRequest;
import com.tiesverse.backend.assessment.dto.request.SubmitAssessmentRequest;
import com.tiesverse.backend.assessment.dto.response.AssessmentResponse;
import com.tiesverse.backend.assessment.dto.response.AssessmentResultResponse;
import com.tiesverse.backend.assessment.dto.response.QuestionResponse;
import com.tiesverse.backend.auth.entity.Account;

import java.util.List;
import java.util.UUID;

public interface AssessmentService {

    AssessmentResponse createAssessment(CreateAssessmentRequest request);

    AssessmentResponse getAssessment(UUID assessmentId);

    List<AssessmentResponse> getAssessmentsByCourse(UUID courseId);

    AssessmentResponse updateAssessment(UUID assessmentId, CreateAssessmentRequest request);

    void deleteAssessment(UUID assessmentId);

    QuestionResponse createQuestion(UUID assessmentId, CreateQuestionRequest request);

    QuestionResponse updateQuestion(UUID questionId, CreateQuestionRequest request);

    void deleteQuestion(UUID questionId);

    AssessmentResultResponse submitAssessment(UUID userId, SubmitAssessmentRequest request);

    AssessmentResultResponse getResult(UUID resultId, Account requester);

    List<AssessmentResultResponse> getResultHistory(UUID userId, UUID assessmentId);
}
