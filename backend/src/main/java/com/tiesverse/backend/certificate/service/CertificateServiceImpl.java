package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.dto.response.CertificateResponse;
import com.tiesverse.backend.certificate.entity.Certificate;
import com.tiesverse.backend.certificate.mapper.CertificateMapper;
import com.tiesverse.backend.certificate.repository.CertificateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final CertificateMapper certificateMapper;

    @Override
    public CertificateResponse generateCertificate(UUID userId, UUID courseId) {
        certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .ifPresent(c -> {
                    throw new RuntimeException("Certificate already exists for this user and course");
                });

        String certificateNumber = "CERT-" + System.currentTimeMillis() + "-"
                + ThreadLocalRandom.current().nextInt(1000, 9999);

        Certificate certificate = Certificate.builder()
                .userId(userId)
                .courseId(courseId)
                .certificateNumber(certificateNumber)
                .issuedDate(LocalDate.now())
                .build();

        Certificate saved = certificateRepository.save(certificate);
        return certificateMapper.toResponse(saved);
    }

    @Override
    public List<CertificateResponse> getUserCertificates(UUID userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(certificateMapper::toResponse)
                .toList();
    }

    @Override
    public CertificateResponse getCertificateByNumber(String number) {
        Certificate certificate = certificateRepository.findByCertificateNumber(number)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return certificateMapper.toResponse(certificate);
    }

    @Override
    public String downloadCertificate(UUID certificateId) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
        return certificate.getFileUrl();
    }
}
