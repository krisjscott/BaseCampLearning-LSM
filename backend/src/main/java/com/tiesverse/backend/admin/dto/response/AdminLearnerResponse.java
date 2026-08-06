package com.tiesverse.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminLearnerResponse {
    private UUID userId;
    private String fullName;
    private String email;
    private String learnerCode;
    private String role;
    private boolean active;
    private LocalDateTime createdAt;
}
