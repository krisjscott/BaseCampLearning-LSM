package com.tiesverse.backend.notification.dto.request;

import com.tiesverse.backend.common.enums.NotificationCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class SendNotificationRequest {

    @NotNull
    private UUID userId;

    @NotBlank
    private String title;

    @NotBlank
    private String message;

    private NotificationCategory category;

    private String actionUrl;
}
