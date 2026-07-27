package com.tiesverse.backend.search.service;

import com.tiesverse.backend.search.dto.request.SearchRequest;
import com.tiesverse.backend.search.dto.response.SearchResponse;
import com.tiesverse.backend.search.dto.response.SearchResultResponse;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SearchServiceImpl implements SearchService {

    @Override
    public SearchResponse search(SearchRequest request) {
        return SearchResponse.builder()
                .results(List.of())
                .totalHits(0L)
                .page(request.getPage())
                .size(request.getSize())
                .build();
    }
}
