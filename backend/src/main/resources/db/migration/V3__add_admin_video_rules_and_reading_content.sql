-- V3__add_admin_video_rules_and_reading_content.sql
-- Backing tables for the new admin-only video rules singleton and reading content.

CREATE TABLE video_rules (
    id UUID PRIMARY KEY,
    max_file_size_bytes BIGINT NOT NULL,
    max_duration_minutes INTEGER,
    default_encoding_profile VARCHAR(100),
    require_transcoding BOOLEAN DEFAULT TRUE,
    auto_generate_thumbnails BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE video_rules_allowed_formats (
    video_rules_id UUID NOT NULL REFERENCES video_rules(id) ON DELETE CASCADE,
    format VARCHAR(50)
);

CREATE TABLE video_rules_allowed_codecs (
    video_rules_id UUID NOT NULL REFERENCES video_rules(id) ON DELETE CASCADE,
    codec VARCHAR(50)
);

CREATE TABLE reading_contents (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    content_html TEXT,
    content_markdown TEXT,
    estimated_reading_minutes INTEGER,
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_reading_contents_lesson_id ON reading_contents(lesson_id);
