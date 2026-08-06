package com.tiesverse.backend.contest.service;

import com.tiesverse.backend.assessment.entity.Assessment;
import com.tiesverse.backend.assessment.entity.AssessmentResult;
import com.tiesverse.backend.assessment.repository.AssessmentRepository;
import com.tiesverse.backend.assessment.repository.AssessmentResultRepository;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.contest.dto.request.CreateContestRequest;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;
import com.tiesverse.backend.contest.entity.Contest;
import com.tiesverse.backend.contest.repository.ContestRepository;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class ContestServiceImpl implements ContestService {

    private final ContestRepository contestRepository;
    private final AssessmentRepository assessmentRepository;
    private final AssessmentResultRepository assessmentResultRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ContestResponse> listContests(UUID courseId) {
        List<Contest> contests = courseId != null
                ? contestRepository.findByCourseIdOrderByStartAtDesc(courseId)
                : contestRepository.findAllByOrderByStartAtDesc();
        return contests.stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContestResponse> getActiveContests(UUID courseId) {
        LocalDateTime now = LocalDateTime.now();
        return contestRepository.findByCourseIdOrderByStartAtDesc(courseId).stream()
                .filter(contest -> !now.isBefore(contest.getStartAt()) && !now.isAfter(contest.getEndAt()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    public ContestResponse createContest(CreateContestRequest request, UUID createdById) {
        if (!assessmentRepository.existsById(request.getAssessmentId())) {
            throw new ResourceNotFoundException("Assessment", "id", request.getAssessmentId());
        }
        if (!courseRepository.existsById(request.getCourseId())) {
            throw new ResourceNotFoundException("Course", "id", request.getCourseId());
        }
        Contest contest = Contest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .assessmentId(request.getAssessmentId())
                .courseId(request.getCourseId())
                .createdById(createdById)
                .startAt(request.getStartAt())
                .endAt(request.getEndAt())
                .build();
        return toResponse(contestRepository.save(contest));
    }

    @Override
    public void deleteContest(UUID id) {
        if (!contestRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contest", "id", id);
        }
        contestRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LeaderboardEntryResponse> getLeaderboard(UUID contestId) {
        Contest contest = contestRepository.findById(contestId)
                .orElseThrow(() -> new ResourceNotFoundException("Contest", "id", contestId));

        List<AssessmentResult> results = assessmentResultRepository.findByAssessmentIdIn(List.of(contest.getAssessmentId())).stream()
                .filter(result -> result.getSubmittedAt() != null
                        && !result.getSubmittedAt().isBefore(contest.getStartAt())
                        && !result.getSubmittedAt().isAfter(contest.getEndAt()))
                .toList();

        Map<UUID, AssessmentResult> bestPerUser = results.stream()
                .collect(Collectors.toMap(
                        AssessmentResult::getUserId,
                        r -> r,
                        (a, b) -> {
                            int scoreCompare = Integer.compare(
                                    b.getScore() == null ? 0 : b.getScore(),
                                    a.getScore() == null ? 0 : a.getScore());
                            if (scoreCompare != 0) return scoreCompare > 0 ? b : a;
                            return a.getSubmittedAt().isBefore(b.getSubmittedAt()) ? a : b;
                        }));

        List<AssessmentResult> ranked = bestPerUser.values().stream()
                .sorted(Comparator
                        .comparing((AssessmentResult r) -> r.getScore() == null ? 0 : r.getScore(), Comparator.reverseOrder())
                        .thenComparing(AssessmentResult::getSubmittedAt))
                .toList();

        List<LeaderboardEntryResponse> leaderboard = new java.util.ArrayList<>();
        int rank = 1;
        for (AssessmentResult result : ranked) {
            String userName = userRepository.findById(result.getUserId()).map(User::getFullName).orElse(null);
            leaderboard.add(LeaderboardEntryResponse.builder()
                    .rank(rank++)
                    .userId(result.getUserId())
                    .userName(userName)
                    .score(result.getScore())
                    .submittedAt(result.getSubmittedAt())
                    .build());
        }
        return leaderboard;
    }

    private ContestResponse toResponse(Contest contest) {
        String assessmentTitle = assessmentRepository.findById(contest.getAssessmentId()).map(Assessment::getTitle).orElse(null);
        String courseTitle = courseRepository.findById(contest.getCourseId()).map(Course::getTitle).orElse(null);
        LocalDateTime now = LocalDateTime.now();
        String status = now.isBefore(contest.getStartAt()) ? "UPCOMING" : now.isAfter(contest.getEndAt()) ? "ENDED" : "ACTIVE";
        return ContestResponse.builder()
                .id(contest.getId())
                .title(contest.getTitle())
                .description(contest.getDescription())
                .assessmentId(contest.getAssessmentId())
                .assessmentTitle(assessmentTitle)
                .courseId(contest.getCourseId())
                .courseTitle(courseTitle)
                .startAt(contest.getStartAt())
                .endAt(contest.getEndAt())
                .status(status)
                .build();
    }
}
