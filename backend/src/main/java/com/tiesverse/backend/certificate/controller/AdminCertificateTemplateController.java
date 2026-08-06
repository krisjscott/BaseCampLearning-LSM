package com.tiesverse.backend.certificate.controller;

import com.tiesverse.backend.certificate.dto.request.SaveCertificateTemplateLayoutRequest;
import com.tiesverse.backend.certificate.dto.response.CertificateTemplateResponse;
import com.tiesverse.backend.certificate.service.CertificateTemplateService;
import com.tiesverse.backend.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/certificate-templates")
@RequiredArgsConstructor
public class AdminCertificateTemplateController {

    private final CertificateTemplateService certificateTemplateService;

    @PostMapping("/course/{courseId}")
    public ApiResponse<CertificateTemplateResponse> upload(@PathVariable UUID courseId,
                                                             @RequestPart("file") MultipartFile file) {
        return ApiResponse.success("Certificate template uploaded", certificateTemplateService.uploadTemplate(courseId, file));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<CertificateTemplateResponse> getByCourse(@PathVariable UUID courseId) {
        return ApiResponse.success(certificateTemplateService.getByCourseId(courseId));
    }

    @PutMapping("/{templateId}/layout")
    public ApiResponse<CertificateTemplateResponse> saveLayout(@PathVariable UUID templateId,
                                                                 @Valid @RequestBody SaveCertificateTemplateLayoutRequest request) {
        return ApiResponse.success("Layout saved", certificateTemplateService.saveLayout(templateId, request.getElements()));
    }

    @GetMapping("/{templateId}/preview")
    public ResponseEntity<byte[]> preview(@PathVariable UUID templateId) {
        byte[] pdf = certificateTemplateService.preview(templateId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"preview.pdf\"")
                .body(pdf);
    }

    @DeleteMapping("/{templateId}")
    public ApiResponse<Void> delete(@PathVariable UUID templateId) {
        certificateTemplateService.delete(templateId);
        return ApiResponse.success("Certificate template deleted", null);
    }
}
