package com.tiesverse.backend.search.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SearchResultResponse {

    private UUID id;
    private String type;
    private String title;
    private String description;
    private String imageUrl;
    private String additionalInfo;
}
