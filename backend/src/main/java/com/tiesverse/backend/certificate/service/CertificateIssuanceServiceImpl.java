package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.repository.CertificateRepository;
import com.tiesverse.backend.certificate.repository.CertificateTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateIssuanceServiceImpl implements CertificateIssuanceService {

    private final CertificateRepository certificateRepository;
    private final CertificateTemplateRepository certificateTemplateRepository;
    private final CertificateService certificateService;

    @Override
    @Transactional
    public void issueIfEligible(UUID userId, UUID courseId) {
        if (certificateRepository.findByUserIdAndCourseId(userId, courseId).isPresent()) {
            return;
        }
        if (certificateTemplateRepository.findByCourseId(courseId).isEmpty()) {
            return;
        }
        certificateService.generateCertificate(userId, courseId);
    }
}
