package com.tiesverse.backend.admin.dto.response;

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
public class AdminVideoRulesResponse {
    private String id;
    private java.util.List<String> allowedFormats;
    private Long maxFileSizeBytes;
    private Integer maxDurationMinutes;
    private java.util.List<String> allowedCodecs;
    private String defaultEncodingProfile;
    private Boolean requireTranscoding;
    private Boolean autoGenerateThumbnails;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}