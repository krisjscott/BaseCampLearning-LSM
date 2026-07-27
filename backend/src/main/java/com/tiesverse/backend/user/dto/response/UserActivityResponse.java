package com.tiesverse.backend.user.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class UserActivityResponse {

    private UUID id;
    private String activityType;
    private String description;
    private LocalDateTime activityDate;
}
