package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.dto.request.CertificateTemplateElementDto;
import com.tiesverse.backend.certificate.dto.response.CertificateTemplateResponse;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

public interface CertificateTemplateService {

    CertificateTemplateResponse uploadTemplate(UUID courseId, MultipartFile file, Principal principal);

    CertificateTemplateResponse getByCourseId(UUID courseId, Principal principal);

    CertificateTemplateResponse getByTemplateId(UUID templateId);

    CertificateTemplateResponse saveLayout(UUID templateId, List<CertificateTemplateElementDto> elements, Principal principal);

    void delete(UUID templateId, Principal principal);

    byte[] preview(UUID templateId, Principal principal);
}
