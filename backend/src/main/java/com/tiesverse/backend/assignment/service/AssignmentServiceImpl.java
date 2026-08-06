package com.tiesverse.backend.assignment.service;

import com.tiesverse.backend.assignment.dto.request.GradeSubmissionRequest;
import com.tiesverse.backend.assignment.dto.response.AssignmentSubmissionResponse;
import com.tiesverse.backend.assignment.entity.AssignmentSubmission;
import com.tiesverse.backend.assignment.repository.AssignmentSubmissionRepository;
import com.tiesverse.backend.common.enums.SubmissionStatus;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.common.storage.FileStorageService;
import com.tiesverse.backend.course.repository.LessonRepository;
import com.tiesverse.backend.course.entity.Lesson;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentSubmissionRepository submissionRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Override
    public AssignmentSubmissionResponse submit(UUID lessonId, UUID userId, String submissionText, MultipartFile file) {
        if (!lessonRepository.existsById(lessonId)) {
            throw new ResourceNotFoundException("Lesson", "id", lessonId);
        }
        if (!StringUtils.hasText(submissionText) && (file == null || file.isEmpty())) {
            throw new BadRequestException("Provide a written response or a file to submit");
        }

        AssignmentSubmission submission = submissionRepository.findByLessonIdAndUserId(lessonId, userId)
                .orElseGet(() -> AssignmentSubmission.builder().lessonId(lessonId).userId(userId).build());

        if (StringUtils.hasText(submissionText)) {
            submission.setSubmissionText(submissionText);
        }
        if (file != null && !file.isEmpty()) {
            submission.setFileUrl(fileStorageService.store(file, "submissions"));
        }
        // A resubmission clears any prior grade - it is a new attempt at the assignment.
        submission.setStatus(SubmissionStatus.SUBMITTED);
        submission.setScore(null);
        submission.setFeedback(null);
        submission.setGradedById(null);
        submission.setGradedAt(null);

        return toResponse(submissionRepository.save(submission));
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentSubmissionResponse getMySubmission(UUID lessonId, UUID userId) {
        return submissionRepository.findByLessonIdAndUserId(lessonId, userId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentSubmissionResponse> getSubmissionsForLesson(UUID lessonId) {
        return submissionRepository.findByLessonIdOrderByCreatedAtDesc(lessonId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public AssignmentSubmissionResponse gradeSubmission(UUID submissionId, UUID graderUserId, GradeSubmissionRequest request) {
        AssignmentSubmission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));
        submission.setScore(request.getScore());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);
        submission.setGradedById(graderUserId);
        submission.setGradedAt(LocalDateTime.now());
        return toResponse(submissionRepository.save(submission));
    }

    private AssignmentSubmissionResponse toResponse(AssignmentSubmission submission) {
        String lessonTitle = lessonRepository.findById(submission.getLessonId()).map(Lesson::getTitle).orElse(null);
        String userName = userRepository.findById(submission.getUserId()).map(User::getFullName).orElse(null);
        String gradedByName = submission.getGradedById() == null ? null
                : userRepository.findById(submission.getGradedById()).map(User::getFullName).orElse(null);
        return AssignmentSubmissionResponse.builder()
                .id(submission.getId())
                .lessonId(submission.getLessonId())
                .lessonTitle(lessonTitle)
                .userId(submission.getUserId())
                .userName(userName)
                .submissionText(submission.getSubmissionText())
                .fileUrl(submission.getFileUrl())
                .status(submission.getStatus())
                .score(submission.getScore())
                .feedback(submission.getFeedback())
                .gradedByName(gradedByName)
                .gradedAt(submission.getGradedAt())
                .createdAt(submission.getCreatedAt())
                .updatedAt(submission.getUpdatedAt())
                .build();
    }
}
