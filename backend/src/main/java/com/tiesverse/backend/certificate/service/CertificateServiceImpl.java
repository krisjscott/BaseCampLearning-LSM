package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.auth.entity.Account;
import com.tiesverse.backend.certificate.dto.response.CertificateResponse;
import com.tiesverse.backend.certificate.entity.Certificate;
import com.tiesverse.backend.certificate.entity.CertificateTemplate;
import com.tiesverse.backend.certificate.entity.CertificateTemplateElement;
import com.tiesverse.backend.certificate.mapper.CertificateMapper;
import com.tiesverse.backend.certificate.repository.CertificateRepository;
import com.tiesverse.backend.certificate.repository.CertificateTemplateElementRepository;
import com.tiesverse.backend.certificate.repository.CertificateTemplateRepository;
import com.tiesverse.backend.common.enums.Role;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ConflictException;
import com.tiesverse.backend.common.exception.ForbiddenException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.common.util.IdCodec;
import com.tiesverse.backend.course.entity.Course;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.user.entity.User;
import com.tiesverse.backend.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class CertificateServiceImpl implements CertificateService {

    private static final Set<Role> ADMIN_ROLES = Set.of(Role.HR_ADMIN, Role.ORGANIZATION_ADMIN, Role.SUPER_ADMIN);

    private final CertificateRepository certificateRepository;
    private final CertificateMapper certificateMapper;
    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final CertificateTemplateRepository certificateTemplateRepository;
    private final CertificateTemplateElementRepository certificateTemplateElementRepository;
    private final CertificatePdfRenderService certificatePdfRenderService;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    @Transactional
    public CertificateResponse generateCertificate(UUID userId, UUID courseId) {
        certificateRepository.findByUserIdAndCourseId(userId, courseId)
                .ifPresent(c -> {
                    throw new ConflictException("Certificate already exists for this user and course");
                });

        CertificateTemplate template = certificateTemplateRepository.findByCourseId(courseId)
                .orElseThrow(() -> new BadRequestException("No certificate template configured for this course"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));

        String certificateNumber = "CERT-" + System.currentTimeMillis() + "-"
                + ThreadLocalRandom.current().nextInt(1000, 9999);

        Certificate certificate = Certificate.builder()
                .userId(userId)
                .courseId(courseId)
                .certificateTemplateId(template.getId())
                .certificateNumber(certificateNumber)
                .title("Certificate of Completion - " + course.getTitle())
                .recipientName(user.getFullName())
                .courseName(course.getTitle())
                .issuerName("BaseCamp")
                .issuedDate(LocalDate.now())
                .build();

        Certificate saved = certificateRepository.save(certificate);
        return certificateMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CertificateResponse> getUserCertificates(UUID userId) {
        return certificateRepository.findByUserId(userId).stream()
                .map(certificateMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateByNumber(String number) {
        Certificate certificate = certificateRepository.findByCertificateNumber(number)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "certificateNumber", number));
        return certificateMapper.toResponse(certificate);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(UUID certificateId, Account requester) {
        Certificate certificate = findOwnedCertificate(certificateId, requester);
        return certificateMapper.toResponse(certificate);
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateDownload downloadCertificatePdf(UUID certificateId, Account requester) {
        Certificate certificate = findOwnedCertificate(certificateId, requester);

        CertificateTemplate template = (certificate.getCertificateTemplateId() != null
                ? certificateTemplateRepository.findById(certificate.getCertificateTemplateId())
                : certificateTemplateRepository.findByCourseId(certificate.getCourseId()))
                .orElseThrow(() -> new BadRequestException("No certificate template configured for this course"));

        List<CertificateTemplateElement> elements = certificateTemplateElementRepository
                .findByTemplateIdOrderByOrderIndexAsc(template.getId());

        Map<String, String> tokenValues = Map.of(
                "recipient_name", nullToEmpty(certificate.getRecipientName()),
                "course_name", nullToEmpty(certificate.getCourseName()),
                "certificate_number", nullToEmpty(certificate.getCertificateNumber()),
                "issued_date", certificate.getIssuedDate() != null ? certificate.getIssuedDate().toString() : "",
                "issuer_name", nullToEmpty(certificate.getIssuerName()));
        String verifyUrl = frontendUrl + "/verify-credential?certificateNumber="
                + IdCodec.encodeId(certificate.getCertificateNumber());

        byte[] pdf = certificatePdfRenderService.render(template, elements, tokenValues, verifyUrl);
        return new CertificateDownload(pdf, certificate.getCertificateNumber() + ".pdf");
    }

    private Certificate findOwnedCertificate(UUID certificateId, Account requester) {
        Certificate certificate = certificateRepository.findById(certificateId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate", "id", certificateId));
        boolean canRead = requester != null
                && (certificate.getUserId().equals(requester.getUserId()) || ADMIN_ROLES.contains(requester.getRole()));
        if (!canRead) {
            throw new ForbiddenException("You can only access your own certificates");
        }
        return certificate;
    }

    private String nullToEmpty(String value) {
        return value != null ? value : "";
    }
}
