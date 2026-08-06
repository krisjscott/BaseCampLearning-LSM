package com.tiesverse.backend.admin.dto.request;

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
public class UpdateAdminReadingContentRequest {
    private String title;
    private String contentHtml;
    private String contentMarkdown;
    @PositiveOrZero(message = "Estimated reading minutes must be non-negative")
    private Integer estimatedReadingMinutes;
}