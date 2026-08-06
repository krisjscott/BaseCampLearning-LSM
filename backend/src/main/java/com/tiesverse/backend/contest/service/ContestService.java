package com.tiesverse.backend.contest.service;

import com.tiesverse.backend.contest.dto.request.CreateContestRequest;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;

import java.util.List;
import java.util.UUID;

public interface ContestService {

    List<ContestResponse> listContests(UUID courseId);

    List<ContestResponse> getActiveContests(UUID courseId);

    ContestResponse createContest(CreateContestRequest request, UUID createdById);

    void deleteContest(UUID id);

    List<LeaderboardEntryResponse> getLeaderboard(UUID contestId);
}
