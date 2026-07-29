package com.tiesverse.backend.analytics.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DailyActiveUsersResponse {

    private LocalDate date;
    private long activeUsers;
}
