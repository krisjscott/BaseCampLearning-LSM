package com.tiesverse.backend.assignment.controller;

import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import com.tiesverse.backend.assignment.service.AssignmentService;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/assignments")
@RequiredArgsConstructor
public class AssignmentController {

    private final AssignmentService assignmentService;
    private final AuthContext authContext;

    @PostMapping(value = "/{lessonId}/submit")
    public ApiResponse<AssignmentSubmissionResponse> submit(Principal principal,
                                                               @PathVariable UUID lessonId,
                                                               @RequestParam(required = false) String text,
                                                               @RequestPart(value = "file", required = false) MultipartFile file) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success("Submission saved", assignmentService.submit(lessonId, userId, text, file));
    }

    @GetMapping("/{lessonId}/my-submission")
    public ApiResponse<AssignmentSubmissionResponse> getMySubmission(Principal principal, @PathVariable UUID lessonId) {
        UUID userId = authContext.currentUserId(principal);
        return ApiResponse.success(assignmentService.getMySubmission(lessonId, userId));
    }
}
