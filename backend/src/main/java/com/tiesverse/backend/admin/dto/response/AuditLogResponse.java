package com.tiesverse.backend.admin.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AuditLogResponse {
    private UUID id;
    private UUID userId;
    private String actorName;
    private String action;
    private String entityType;
    private String entityId;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;
}
