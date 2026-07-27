package com.tiesverse.backend.search.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class SearchResponse {

    private List<SearchResultResponse> results;
    private long totalHits;
    private Integer page;
    private Integer size;
}
