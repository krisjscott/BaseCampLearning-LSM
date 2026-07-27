package com.tiesverse.backend.content.dto.request;

import com.tiesverse.backend.common.enums.ContentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class CreateContentRequest {

    @NotBlank
    private String title;

    private String description;

    @NotNull
    private ContentType contentType;

    @NotBlank
    private String fileUrl;

    private String thumbnailUrl;

    private Long fileSize;

    private String mimeType;

    private UUID courseId;
}
