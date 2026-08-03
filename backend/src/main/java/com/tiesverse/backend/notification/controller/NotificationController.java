package com.tiesverse.backend.notification.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.notification.dto.response.NotificationResponse;
import com.tiesverse.backend.notification.service.NotificationService;
import com.tiesverse.backend.security.AuthContext;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final AuthContext authContext;

    @GetMapping("/my-notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getMyNotifications(Principal principal) {
        List<NotificationResponse> notifications = notificationService.getUserNotifications(authContext.currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        long count = notificationService.getUnreadCount(authContext.currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(Principal principal, @PathVariable UUID id) {
        NotificationResponse response = notificationService.markAsRead(id, authContext.currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        notificationService.markAllAsRead(authContext.currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(Principal principal, @PathVariable UUID id) {
        notificationService.deleteNotification(id, authContext.currentUserId(principal));
        return ResponseEntity.ok(ApiResponse.success("Notification deleted", null));
    }
}
