package com.tiesverse.backend.search.controller;

import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.search.dto.request.SearchRequest;
import com.tiesverse.backend.search.dto.response.SearchResponse;
import com.tiesverse.backend.search.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ApiResponse<SearchResponse> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "20") Integer size
    ) {
        SearchRequest request = new SearchRequest();
        request.setQuery(query);
        request.setType(type);
        request.setPage(page);
        request.setSize(size);
        return ApiResponse.success(searchService.search(request));
    }
}
