package com.tiesverse.backend.course.dto.request;

import com.tiesverse.backend.common.enums.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateLessonRequest {

    @NotBlank
    private String title;

    private String description;

    private String contentUrl;

    private ContentType contentType;

    private Integer durationMinutes;

    private Integer orderIndex;

    @NotNull
    private UUID moduleId;
}
