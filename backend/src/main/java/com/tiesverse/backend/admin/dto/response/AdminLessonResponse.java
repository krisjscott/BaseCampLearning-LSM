package com.tiesverse.backend.admin.dto.response;

import com.tiesverse.backend.common.enums.ContentType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminLessonResponse {
    private String id;
    private String title;
    private String description;
    private String contentUrl;
    private String captionsUrl;
    private ContentType contentType;
    private Integer durationMinutes;
    private Integer orderIndex;
    private String moduleId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}