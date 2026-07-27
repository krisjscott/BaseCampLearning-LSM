package com.tiesverse.backend.content.service;

import com.tiesverse.backend.common.enums.ContentType;
import com.tiesverse.backend.content.dto.request.CreateContentRequest;
import com.tiesverse.backend.content.dto.request.UpdateContentRequest;
import com.tiesverse.backend.content.dto.response.ContentResponse;

import java.util.List;
import java.util.UUID;

public interface ContentService {

    ContentResponse upload(CreateContentRequest request);

    ContentResponse update(UUID id, UpdateContentRequest request);

    void delete(UUID id);

    ContentResponse getById(UUID id);

    List<ContentResponse> getByCourse(UUID courseId);

    List<ContentResponse> getByType(ContentType type);
}
