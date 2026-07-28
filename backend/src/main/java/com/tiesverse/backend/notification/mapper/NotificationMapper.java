package com.tiesverse.backend.notification.mapper;

import com.tiesverse.backend.notification.dto.response.NotificationResponse;
import com.tiesverse.backend.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationMapper INSTANCE = Mappers.getMapper(NotificationMapper.class);

    NotificationResponse toResponse(Notification notification);
}
