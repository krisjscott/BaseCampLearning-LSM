package com.tiesverse.backend.content.dto.response;

import com.tiesverse.backend.common.enums.ContentType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ContentResponse {

    private UUID id;
    private String title;
    private String description;
    private ContentType contentType;
    private String fileUrl;
    private String thumbnailUrl;
    private Long fileSize;
    private String mimeType;
    private UUID uploadedById;
    private UUID courseId;
    private LocalDateTime createdAt;
}
