package com.tiesverse.backend.certificate.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@Builder
public class CertificateTemplateResponse {

    private UUID id;
    private UUID courseId;
    private String originalPdfUrl;
    private String originalFilename;
    private Double pageWidth;
    private Double pageHeight;
    private List<CertificateTemplateElementResponse> elements;
}
