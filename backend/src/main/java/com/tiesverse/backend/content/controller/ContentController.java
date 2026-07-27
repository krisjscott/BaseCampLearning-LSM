package com.tiesverse.backend.content.controller;

import com.tiesverse.backend.common.enums.ContentType;
import com.tiesverse.backend.common.response.ApiResponse;
import com.tiesverse.backend.content.dto.request.CreateContentRequest;
import com.tiesverse.backend.content.dto.request.UpdateContentRequest;
import com.tiesverse.backend.content.dto.response.ContentResponse;
import com.tiesverse.backend.content.service.ContentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contents")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    @PostMapping
    public ResponseEntity<ApiResponse<ContentResponse>> create(@Valid @RequestBody CreateContentRequest request) {
        ContentResponse response = contentService.upload(request);
        return ResponseEntity.ok(ApiResponse.success("Content created", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> update(@PathVariable UUID id,
                                                               @RequestBody UpdateContentRequest request) {
        ContentResponse response = contentService.update(id, request);
        return ResponseEntity.ok(ApiResponse.success("Content updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        contentService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Content deleted", null));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContentResponse>> getById(@PathVariable UUID id) {
        ContentResponse response = contentService.getById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<ApiResponse<List<ContentResponse>>> getByCourse(@PathVariable UUID courseId) {
        List<ContentResponse> responses = contentService.getByCourse(courseId);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/type/{type}")
    public ResponseEntity<ApiResponse<List<ContentResponse>>> getByType(@PathVariable ContentType type) {
        List<ContentResponse> responses = contentService.getByType(type);
        return ResponseEntity.ok(ApiResponse.success(responses));
    }
}
