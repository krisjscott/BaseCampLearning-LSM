package com.tiesverse.backend.content.service;

import com.tiesverse.backend.common.enums.ContentType;
import com.tiesverse.backend.content.dto.request.CreateContentRequest;
import com.tiesverse.backend.content.dto.request.UpdateContentRequest;
import com.tiesverse.backend.content.dto.response.ContentResponse;
import com.tiesverse.backend.content.entity.Content;
import com.tiesverse.backend.content.mapper.ContentMapper;
import com.tiesverse.backend.content.repository.ContentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ContentServiceImpl implements ContentService {

    private final ContentRepository contentRepository;
    private final ContentMapper contentMapper;

    @Override
    public ContentResponse upload(CreateContentRequest request) {
        Content content = Content.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .contentType(request.getContentType())
                .fileUrl(request.getFileUrl())
                .thumbnailUrl(request.getThumbnailUrl())
                .fileSize(request.getFileSize())
                .mimeType(request.getMimeType())
                .courseId(request.getCourseId())
                .build();

        Content saved = contentRepository.save(content);
        return contentMapper.toResponse(saved);
    }

    @Override
    public ContentResponse update(UUID id, UpdateContentRequest request) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));

        if (request.getTitle() != null) {
            content.setTitle(request.getTitle());
        }
        if (request.getDescription() != null) {
            content.setDescription(request.getDescription());
        }
        if (request.getThumbnailUrl() != null) {
            content.setThumbnailUrl(request.getThumbnailUrl());
        }

        Content saved = contentRepository.save(content);
        return contentMapper.toResponse(saved);
    }

    @Override
    public void delete(UUID id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        contentRepository.delete(content);
    }

    @Override
    public ContentResponse getById(UUID id) {
        Content content = contentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Content not found"));
        return contentMapper.toResponse(content);
    }

    @Override
    public List<ContentResponse> getByCourse(UUID courseId) {
        return contentRepository.findByCourseId(courseId).stream()
                .map(contentMapper::toResponse)
                .toList();
    }

    @Override
    public List<ContentResponse> getByType(ContentType type) {
        return contentRepository.findByContentType(type).stream()
                .map(contentMapper::toResponse)
                .toList();
    }
}
