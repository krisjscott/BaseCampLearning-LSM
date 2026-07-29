package com.tiesverse.backend.search.service;

import com.tiesverse.backend.search.dto.request.SearchRequest;
import com.tiesverse.backend.search.dto.response.SearchResponse;

public interface SearchService {

    SearchResponse search(SearchRequest request);
}
