package com.tiesverse.backend.notification.service;

import com.tiesverse.backend.notification.dto.request.SendBulkNotificationRequest;
import com.tiesverse.backend.notification.dto.request.SendNotificationRequest;
import com.tiesverse.backend.notification.dto.response.NotificationResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationService {

    NotificationResponse sendNotification(SendNotificationRequest request);

    void sendBulkNotification(SendBulkNotificationRequest request);

    List<NotificationResponse> getUserNotifications(UUID userId);

    long getUnreadCount(UUID userId);

    NotificationResponse markAsRead(UUID notificationId, UUID userId);

    void markAllAsRead(UUID userId);

    void deleteNotification(UUID notificationId, UUID userId);
}
