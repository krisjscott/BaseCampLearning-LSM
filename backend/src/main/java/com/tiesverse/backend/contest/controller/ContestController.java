package com.tiesverse.backend.contest.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.contest.dto.response.ContestResponse;
import com.tiesverse.backend.contest.dto.response.LeaderboardEntryResponse;
import com.tiesverse.backend.contest.service.ContestService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contests")
@RequiredArgsConstructor
public class ContestController {

    private final ContestService contestService;

    @GetMapping("/active")
    public ApiResponse<List<ContestResponse>> getActiveContests(@RequestParam UUID courseId) {
        return ApiResponse.success(contestService.getActiveContests(courseId));
    }

    @GetMapping("/{id}/leaderboard")
    public ApiResponse<List<LeaderboardEntryResponse>> getLeaderboard(@PathVariable UUID id) {
        return ApiResponse.success(contestService.getLeaderboard(id));
    }
}
