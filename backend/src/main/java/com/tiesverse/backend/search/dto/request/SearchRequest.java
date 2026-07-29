package com.tiesverse.backend.search.dto.request;

import lombok.Data;

@Data
public class SearchRequest {

    private String query;
    private String type;
    private Integer page;
    private Integer size;
}
