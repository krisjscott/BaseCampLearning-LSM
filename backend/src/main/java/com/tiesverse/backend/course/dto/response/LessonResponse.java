package com.tiesverse.backend.course.dto.response;

import com.tiesverse.backend.common.enums.ContentType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class LessonResponse {

    private UUID id;

    private String title;

    private String description;

    private String contentUrl;

    private String captionsUrl;

    private ContentType contentType;

    private Integer durationMinutes;

    private Integer orderIndex;
}
