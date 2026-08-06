package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.dto.request.CertificateTemplateElementDto;
import com.tiesverse.backend.certificate.dto.response.CertificateTemplateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface CertificateTemplateService {

    CertificateTemplateResponse uploadTemplate(UUID courseId, MultipartFile file);

    CertificateTemplateResponse getByCourseId(UUID courseId);

    CertificateTemplateResponse getByTemplateId(UUID templateId);

    CertificateTemplateResponse saveLayout(UUID templateId, List<CertificateTemplateElementDto> elements);

    void delete(UUID templateId);

    byte[] preview(UUID templateId);
}
