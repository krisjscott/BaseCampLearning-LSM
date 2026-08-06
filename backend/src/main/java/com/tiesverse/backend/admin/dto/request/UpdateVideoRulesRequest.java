package com.tiesverse.backend.admin.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateVideoRulesRequest {
    @NotNull(message = "Allowed formats is required")
    private List<String> allowedFormats;

    @NotNull(message = "Max file size is required")
    @Positive(message = "Max file size must be positive")
    private Long maxFileSizeBytes;

    @PositiveOrZero(message = "Max duration must be non-negative")
    private Integer maxDurationMinutes;

    private List<String> allowedCodecs;

    private String defaultEncodingProfile;

    private Boolean requireTranscoding;

    private Boolean autoGenerateThumbnails;
}