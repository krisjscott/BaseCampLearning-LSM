package com.tiesverse.backend.content.dto.request;

import lombok.Data;

@Data
public class UpdateContentRequest {

    private String title;

    private String description;

    private String thumbnailUrl;
}
