package com.tiesverse.backend.certificate.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import com.tiesverse.backend.common.enums.CertificateElementType;
import com.tiesverse.backend.common.enums.TextAlign;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "certificate_template_elements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CertificateTemplateElement extends BaseEntity {

    @Column(name = "template_id", nullable = false)
    private UUID templateId;

    @Enumerated(EnumType.STRING)
    @Column(name = "element_type", nullable = false)
    private CertificateElementType elementType;

    /** For {@code TEXT} elements; may contain {{recipient_name}}-style variable tokens. Unused for {@code QR}. */
    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(nullable = false)
    private Double x;

    @Column(nullable = false)
    private Double y;

    @Column(nullable = false)
    private Double width;

    @Column(nullable = false)
    private Double height;

    @Column(name = "font_family")
    private String fontFamily;

    @Column(name = "font_size")
    private Double fontSize;

    @Column(name = "font_color")
    private String fontColor;

    private Boolean bold;

    @Enumerated(EnumType.STRING)
    @Column(name = "text_align")
    private TextAlign textAlign;

    @Column(name = "order_index")
    private Integer orderIndex;
}
