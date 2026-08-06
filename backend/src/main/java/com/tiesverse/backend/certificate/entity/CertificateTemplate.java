package com.tiesverse.backend.certificate.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "certificate_templates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateTemplate extends BaseEntity {

    @Column(name = "course_id", nullable = false, unique = true)
    private UUID courseId;

    @Column(name = "original_pdf_url", nullable = false)
    private String originalPdfUrl;

    @Column(name = "original_filename")
    private String originalFilename;

    @Column(name = "page_width", nullable = false)
    private Double pageWidth;

    @Column(name = "page_height", nullable = false)
    private Double pageHeight;
}
