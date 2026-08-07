package com.tiesverse.backend.admin.dto.response;

import com.tiesverse.backend.common.enums.Role;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AdminAccountResponse {
    private UUID id;
    private UUID userId;
    private String fullName;
    private String email;
    private Role role;
    private boolean active;
    private UUID organizationId;
    private LocalDateTime createdAt;
}
