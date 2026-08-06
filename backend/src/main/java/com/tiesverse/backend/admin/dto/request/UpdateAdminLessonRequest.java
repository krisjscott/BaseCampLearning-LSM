package com.tiesverse.backend.admin.dto.request;

import com.tiesverse.backend.common.enums.ContentType;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateAdminLessonRequest {
    private String title;
    private String description;
    private String contentUrl;
    private ContentType contentType;
    @PositiveOrZero(message = "Duration must be non-negative")
    private Integer durationMinutes;
    private Integer orderIndex;
}
