CREATE TABLE certificate_templates (
    id UUID PRIMARY KEY,
    course_id UUID UNIQUE REFERENCES courses(id),
    original_pdf_url TEXT NOT NULL,
    original_filename VARCHAR(500),
    page_width DOUBLE PRECISION NOT NULL,
    page_height DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE certificate_template_elements (
    id UUID PRIMARY KEY,
    template_id UUID NOT NULL REFERENCES certificate_templates(id) ON DELETE CASCADE,
    element_type VARCHAR(20) NOT NULL,
    content TEXT,
    x DOUBLE PRECISION NOT NULL,
    y DOUBLE PRECISION NOT NULL,
    width DOUBLE PRECISION NOT NULL,
    height DOUBLE PRECISION NOT NULL,
    font_family VARCHAR(100),
    font_size DOUBLE PRECISION,
    font_color VARCHAR(20),
    bold BOOLEAN DEFAULT FALSE,
    text_align VARCHAR(10),
    z_index INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX idx_certificate_template_elements_template_id ON certificate_template_elements(template_id);

ALTER TABLE certificates ADD COLUMN certificate_template_id UUID REFERENCES certificate_templates(id);
