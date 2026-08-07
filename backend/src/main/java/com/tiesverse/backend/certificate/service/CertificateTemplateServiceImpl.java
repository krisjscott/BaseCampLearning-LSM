package com.tiesverse.backend.certificate.service;

import com.tiesverse.backend.certificate.dto.request.CertificateTemplateElementDto;
import com.tiesverse.backend.certificate.dto.response.CertificateTemplateElementResponse;
import com.tiesverse.backend.certificate.dto.response.CertificateTemplateResponse;
import com.tiesverse.backend.certificate.entity.CertificateTemplate;
import com.tiesverse.backend.certificate.entity.CertificateTemplateElement;
import com.tiesverse.backend.certificate.repository.CertificateTemplateElementRepository;
import com.tiesverse.backend.certificate.repository.CertificateTemplateRepository;
import com.tiesverse.backend.common.exception.BadRequestException;
import com.tiesverse.backend.common.exception.ResourceNotFoundException;
import com.tiesverse.backend.common.storage.FileStorageService;
import com.tiesverse.backend.common.util.IdCodec;
import com.tiesverse.backend.course.repository.CourseRepository;
import com.tiesverse.backend.security.AuthContext;
import com.tiesverse.backend.security.OrganizationScope;
import lombok.RequiredArgsConstructor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CertificateTemplateServiceImpl implements CertificateTemplateService {

    private final CertificateTemplateRepository certificateTemplateRepository;
    private final CertificateTemplateElementRepository certificateTemplateElementRepository;
    private final FileStorageService fileStorageService;
    private final CertificatePdfRenderService certificatePdfRenderService;
    private final CourseRepository courseRepository;
    private final AuthContext authContext;
    private final OrganizationScope organizationScope;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Override
    @Transactional
    public CertificateTemplateResponse uploadTemplate(UUID courseId, MultipartFile file, Principal principal) {
        requireCourseAccess(principal, courseId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file was uploaded");
        }
        String extension = FileStorageService.extensionOf(file.getOriginalFilename());
        if (!"pdf".equals(extension)) {
            throw new BadRequestException("Certificate templates must be PDF files");
        }

        double pageWidth;
        double pageHeight;
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            if (document.getNumberOfPages() < 1) {
                throw new BadRequestException("The uploaded PDF has no pages");
            }
            PDPage page = document.getPage(0);
            pageWidth = page.getMediaBox().getWidth();
            pageHeight = page.getMediaBox().getHeight();
        } catch (IOException e) {
            throw new BadRequestException("Could not read the uploaded PDF: " + e.getMessage());
        }

        String url = fileStorageService.store(file, "certificate-templates");

        CertificateTemplate template = certificateTemplateRepository.findByCourseId(courseId)
                .orElseGet(() -> CertificateTemplate.builder().courseId(courseId).build());
        template.setOriginalPdfUrl(url);
        template.setOriginalFilename(file.getOriginalFilename());
        template.setPageWidth(pageWidth);
        template.setPageHeight(pageHeight);
        template = certificateTemplateRepository.save(template);

        return toResponse(template, certificateTemplateElementRepository.findByTemplateIdOrderByOrderIndexAsc(template.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateTemplateResponse getByCourseId(UUID courseId, Principal principal) {
        requireCourseAccess(principal, courseId);
        CertificateTemplate template = certificateTemplateRepository.findByCourseId(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("CertificateTemplate", "courseId", courseId));
        return toResponse(template, certificateTemplateElementRepository.findByTemplateIdOrderByOrderIndexAsc(template.getId()));
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateTemplateResponse getByTemplateId(UUID templateId) {
        CertificateTemplate template = certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CertificateTemplate", "id", templateId));
        return toResponse(template, certificateTemplateElementRepository.findByTemplateIdOrderByOrderIndexAsc(template.getId()));
    }

    @Override
    @Transactional
    public CertificateTemplateResponse saveLayout(UUID templateId, List<CertificateTemplateElementDto> elements, Principal principal) {
        CertificateTemplate template = certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CertificateTemplate", "id", templateId));
        requireCourseAccess(principal, template.getCourseId());

        certificateTemplateElementRepository.deleteByTemplateId(templateId);
        List<CertificateTemplateElement> saved = certificateTemplateElementRepository.saveAll(
                elements.stream().map(dto -> CertificateTemplateElement.builder()
                        .templateId(templateId)
                        .elementType(dto.getElementType())
                        .content(dto.getContent())
                        .x(dto.getX())
                        .y(dto.getY())
                        .width(dto.getWidth())
                        .height(dto.getHeight())
                        .fontFamily(dto.getFontFamily())
                        .fontSize(dto.getFontSize())
                        .fontColor(dto.getFontColor())
                        .bold(dto.getBold())
                        .textAlign(dto.getTextAlign())
                        .orderIndex(dto.getOrderIndex())
                        .build())
                        .toList());

        return toResponse(template, saved);
    }

    @Override
    @Transactional
    public void delete(UUID templateId, Principal principal) {
        CertificateTemplate template = certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CertificateTemplate", "id", templateId));
        requireCourseAccess(principal, template.getCourseId());

        certificateTemplateElementRepository.deleteByTemplateId(templateId);
        certificateTemplateRepository.deleteById(templateId);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] preview(UUID templateId, Principal principal) {
        CertificateTemplate template = certificateTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("CertificateTemplate", "id", templateId));
        requireCourseAccess(principal, template.getCourseId());
        List<CertificateTemplateElement> elements = certificateTemplateElementRepository
                .findByTemplateIdOrderByOrderIndexAsc(templateId);

        String sampleCertificateNumber = "CERT-PREVIEW-0000";
        Map<String, String> tokenValues = Map.of(
                "recipient_name", "Jane Doe",
                "course_name", "Sample Course",
                "certificate_number", sampleCertificateNumber,
                "issued_date", LocalDate.now().toString(),
                "issuer_name", "BaseCamp");
        String verifyUrl = frontendUrl + "/verify-credential?certificateNumber=" + IdCodec.encodeId(sampleCertificateNumber);

        return certificatePdfRenderService.render(template, elements, tokenValues, verifyUrl);
    }

    private void requireCourseAccess(Principal principal, UUID courseId) {
        var caller = authContext.currentAccount(principal);
        var course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", courseId));
        organizationScope.requireSameOrganization(caller, course.getOrganizationId());
    }

    private CertificateTemplateResponse toResponse(CertificateTemplate template, List<CertificateTemplateElement> elements) {
        return CertificateTemplateResponse.builder()
                .id(template.getId())
                .courseId(template.getCourseId())
                .originalPdfUrl(template.getOriginalPdfUrl())
                .originalFilename(template.getOriginalFilename())
                .pageWidth(template.getPageWidth())
                .pageHeight(template.getPageHeight())
                .elements(elements.stream().map(this::toElementResponse).toList())
                .build();
    }

    private CertificateTemplateElementResponse toElementResponse(CertificateTemplateElement element) {
        return CertificateTemplateElementResponse.builder()
                .id(element.getId())
                .elementType(element.getElementType())
                .content(element.getContent())
                .x(element.getX())
                .y(element.getY())
                .width(element.getWidth())
                .height(element.getHeight())
                .fontFamily(element.getFontFamily())
                .fontSize(element.getFontSize())
                .fontColor(element.getFontColor())
                .bold(element.getBold())
                .textAlign(element.getTextAlign())
                .orderIndex(element.getOrderIndex())
                .build();
    }
}
