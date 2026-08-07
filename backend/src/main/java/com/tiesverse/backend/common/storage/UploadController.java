package com.tiesverse.backend.common.storage;

import com.tiesverse.backend.assignment.entity.AssignmentSubmission;
import com.tiesverse.backend.assignment.repository.AssignmentSubmissionRepository;
import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.security.AuthContext;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private static final Set<String> INLINE_SUBDIRECTORIES = Set.of("videos", "captions", "certificate-templates");

    private final FileStorageService fileStorageService;
    private final AssignmentSubmissionRepository assignmentSubmissionRepository;
    private final AuthContext authContext;

    @GetMapping("/uploads/{subDirectory}/{filename:.+}")
    public ResponseEntity<InputStreamResource> download(
            @PathVariable String subDirectory,
            @PathVariable String filename,
            Principal principal,
            HttpServletRequest request
    ) {
        if ("submissions".equals(subDirectory)) {
            requireSubmissionAccess(subDirectory, filename, principal);
        }

        FileStorageService.StoredFile file = fileStorageService.load(subDirectory, filename);
        MediaType contentType = resolveContentType(file.contentType());
        ResponseEntity.BodyBuilder responseBuilder = ResponseEntity.ok()
                .contentType(contentType)
                .contentLength(file.contentLength())
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400");

        // Force a download rather than inline/browser rendering for anything that isn't
        // course media - a non-image/video file served inline is one missing entry in
        // BLOCKED_EXTENSIONS away from being rendered as HTML in the visitor's origin.
        if (!INLINE_SUBDIRECTORIES.contains(subDirectory)) {
            responseBuilder.header(HttpHeaders.CONTENT_DISPOSITION,
                    ContentDisposition.attachment().filename(filename).build().toString());
        }

        return responseBuilder.body(new InputStreamResource(file.inputStream()));
    }

    private void requireSubmissionAccess(String subDirectory, String filename, Principal principal) {
        Account account = authContext.currentAccount(principal);
        if (authContext.isAdmin(account)) {
            return;
        }
        String fileUrl = "/uploads/" + subDirectory + "/" + filename;
        AssignmentSubmission submission = assignmentSubmissionRepository.findByFileUrl(fileUrl)
                .orElseThrow(() -> new ForbiddenException("You do not have access to this file"));
        if (!submission.getUserId().equals(account.getUserId())) {
            throw new ForbiddenException("You do not have access to this file");
        }
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
