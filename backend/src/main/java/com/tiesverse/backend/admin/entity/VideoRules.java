package com.tiesverse.backend.admin.entity;

import com.tiesverse.backend.common.entity.BaseEntity;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

/**
 * Single global settings row describing the platform's video upload rules.
 * There is intentionally only ever one row in this table - see
 * {@code AdminServiceImpl#getVideoRules()} for the lazy-default-creation logic.
 */
@Entity
@Table(name = "video_rules")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VideoRules extends BaseEntity {

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "video_rules_allowed_formats", joinColumns = @JoinColumn(name = "video_rules_id"))
    @Column(name = "format")
    private List<String> allowedFormats;

    @Column(name = "max_file_size_bytes", nullable = false)
    private Long maxFileSizeBytes;

    @Column(name = "max_duration_minutes")
    private Integer maxDurationMinutes;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "video_rules_allowed_codecs", joinColumns = @JoinColumn(name = "video_rules_id"))
    @Column(name = "codec")
    private List<String> allowedCodecs;

    @Column(name = "default_encoding_profile")
    private String defaultEncodingProfile;

    @Column(name = "require_transcoding")
    private Boolean requireTranscoding;

    @Column(name = "auto_generate_thumbnails")
    private Boolean autoGenerateThumbnails;
}
