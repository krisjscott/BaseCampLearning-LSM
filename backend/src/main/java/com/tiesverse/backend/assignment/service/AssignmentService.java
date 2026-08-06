package com.tiesverse.backend.assignment.service;

import com.tiesverse.backend.assignment.dto.request.GradeSubmissionRequest;
import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface AssignmentService {

    AssignmentSubmissionResponse submit(UUID lessonId, UUID userId, String submissionText, MultipartFile file);

    AssignmentSubmissionResponse getMySubmission(UUID lessonId, UUID userId);

    List<AssignmentSubmissionResponse> getSubmissionsForLesson(UUID lessonId);

    AssignmentSubmissionResponse gradeSubmission(UUID submissionId, UUID graderUserId, GradeSubmissionRequest request);
}
