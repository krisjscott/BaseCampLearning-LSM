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

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "certificates")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Certificate extends BaseEntity {

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "course_id", nullable = false)
    private UUID courseId;

    @Column(name = "assessment_result_id")
    private UUID assessmentResultId;

    @Column(name = "certificate_template_id")
    private UUID certificateTemplateId;

    @Column(name = "certificate_number", unique = true, nullable = false)
    private String certificateNumber;

    @Column(nullable = false)
    private String title;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "course_name", nullable = false)
    private String courseName;

    @Column(name = "issuer_name", nullable = false)
    private String issuerName;

    @Column(name = "issued_date", nullable = false)
    private LocalDate issuedDate;

    @Column(name = "file_url")
    private String fileUrl;
}
