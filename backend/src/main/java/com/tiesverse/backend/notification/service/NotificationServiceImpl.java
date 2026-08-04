package com.tiesverse.backend.notification.service;

import com.tiesverse.backend.common.enums.NotificationType;
import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.notification.dto.request.SendBulkNotificationRequest;
import com.tiesverse.backend.notification.dto.request.SendNotificationRequest;
import com.tiesverse.backend.notification.dto.response.NotificationResponse;
import com.tiesverse.backend.notification.entity.Notification;
import com.tiesverse.backend.notification.mapper.NotificationMapper;
import com.tiesverse.backend.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final NotificationMapper notificationMapper;

    @Override
    public NotificationResponse sendNotification(SendNotificationRequest request) {
        Notification notification = Notification.builder()
                .userId(request.getUserId())
                .title(request.getTitle())
                .message(request.getMessage())
                .type(NotificationType.IN_APP)
                .category(request.getCategory())
                .read(false)
                .actionUrl(request.getActionUrl())
                .build();

        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void sendBulkNotification(SendBulkNotificationRequest request) {
        List<Notification> notifications = new ArrayList<>();
        for (UUID userId : request.getUserIds()) {
            notifications.add(Notification.builder()
                    .userId(userId)
                    .title(request.getTitle())
                    .message(request.getMessage())
                    .type(NotificationType.IN_APP)
                    .category(request.getCategory())
                    .read(false)
                    .actionUrl(request.getActionUrl())
                    .build());
        }
        notificationRepository.saveAll(notifications);
    }

    @Override
    public List<NotificationResponse> getUserNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toResponse)
                .toList();
    }

    @Override
    public long getUnreadCount(UUID userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Override
    public NotificationResponse markAsRead(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only update your own notifications");
        }
        notification.setRead(true);
        notification.setReadAt(LocalDateTime.now());
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void markAllAsRead(UUID userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> {
            n.setRead(true);
            n.setReadAt(LocalDateTime.now());
        });
        notificationRepository.saveAll(unread);
    }

    @Override
    public void deleteNotification(UUID notificationId, UUID userId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notification.getUserId().equals(userId)) {
            throw new ForbiddenException("You can only delete your own notifications");
        }
        notificationRepository.delete(notification);
    }
}
