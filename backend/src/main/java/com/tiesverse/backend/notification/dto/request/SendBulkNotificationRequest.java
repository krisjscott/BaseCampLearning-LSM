package com.tiesverse.backend.notification.dto.request;

import com.tiesverse.backend.common.enums.NotificationCategory;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
public class SendBulkNotificationRequest {

    private List<UUID> userIds;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private NotificationCategory category;

    private String actionUrl;
}
