package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.dto.response.CertificateResponse;

import java.util.List;
import java.util.UUID;

public interface CertificateService {

    CertificateResponse generateCertificate(UUID userId, UUID courseId);

    List<CertificateResponse> getUserCertificates(UUID userId);

    CertificateResponse getCertificateByNumber(String number);

    String downloadCertificate(UUID certificateId);
}
