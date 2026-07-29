package com.tiesverse.backend.notification.dto.response;

import com.tiesverse.backend.common.enums.NotificationCategory;
import com.tiesverse.backend.common.enums.NotificationType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class NotificationResponse {

    private UUID id;
    private String title;
    private String message;
    private NotificationType type;
    private NotificationCategory category;
    private boolean read;
    private LocalDateTime readAt;
    private String actionUrl;
    private LocalDateTime createdAt;
}
