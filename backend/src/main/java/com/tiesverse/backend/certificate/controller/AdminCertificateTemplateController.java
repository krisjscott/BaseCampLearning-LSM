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

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/certificate-templates")
@RequiredArgsConstructor
public class AdminCertificateTemplateController {

    private final CertificateTemplateService certificateTemplateService;

    @PostMapping("/course/{courseId}")
    public ApiResponse<CertificateTemplateResponse> upload(@PathVariable UUID courseId,
                                                             @RequestPart("file") MultipartFile file,
                                                             Principal principal) {
        return ApiResponse.success("Certificate template uploaded",
                certificateTemplateService.uploadTemplate(courseId, file, principal));
    }

    @GetMapping("/course/{courseId}")
    public ApiResponse<CertificateTemplateResponse> getByCourse(@PathVariable UUID courseId, Principal principal) {
        return ApiResponse.success(certificateTemplateService.getByCourseId(courseId, principal));
    }

    @PutMapping("/{templateId}/layout")
    public ApiResponse<CertificateTemplateResponse> saveLayout(@PathVariable UUID templateId,
                                                                 @Valid @RequestBody SaveCertificateTemplateLayoutRequest request,
                                                                 Principal principal) {
        return ApiResponse.success("Layout saved",
                certificateTemplateService.saveLayout(templateId, request.getElements(), principal));
    }

    @GetMapping("/{templateId}/preview")
    public ResponseEntity<byte[]> preview(@PathVariable UUID templateId, Principal principal) {
        byte[] pdf = certificateTemplateService.preview(templateId, principal);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"preview.pdf\"")
                .body(pdf);
    }

    @DeleteMapping("/{templateId}")
    public ApiResponse<Void> delete(@PathVariable UUID templateId, Principal principal) {
        certificateTemplateService.delete(templateId, principal);
        return ApiResponse.success("Certificate template deleted", null);
    }
}
