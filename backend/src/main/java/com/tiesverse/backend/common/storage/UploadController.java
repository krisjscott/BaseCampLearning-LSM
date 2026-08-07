package com.tiesverse.backend.common.storage;

import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private final FileStorageService fileStorageService;

    @GetMapping("/uploads/{subDirectory}/{filename:.+}")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable String subDirectory,
            @PathVariable String filename
    ) {
        FileStorageService.StoredFile file = fileStorageService.load(subDirectory, filename);
        MediaType contentType = resolveContentType(file.contentType());
        return ResponseEntity.ok()
                .contentType(contentType)
                .contentLength(file.contentLength())
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(new InputStreamResource(file.inputStream()));
    }

    private MediaType resolveContentType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
        try {
            return MediaType.parseMediaType(contentType);
        } catch (IllegalArgumentException exception) {
            return MediaType.APPLICATION_OCTET_STREAM;
        }
    }
}
