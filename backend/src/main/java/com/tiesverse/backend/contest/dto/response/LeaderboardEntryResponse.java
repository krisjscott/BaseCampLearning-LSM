package com.tiesverse.backend.contest.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class LeaderboardEntryResponse {
    private int rank;
    private UUID userId;
    private String userName;
    private Integer score;
    private LocalDateTime submittedAt;
}
