-- V1__init_schema.sql
-- Full LMS schema migration

CREATE TABLE accounts (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role VARCHAR(50) NOT NULL,
    auth_provider VARCHAR(50) NOT NULL DEFAULT 'LOCAL',
    google_id VARCHAR(255),
    sso_provider_id VARCHAR(255),
    email_verified BOOLEAN DEFAULT FALSE,
    refresh_token TEXT,
    user_id UUID,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    profile_picture_url TEXT,
    phone VARCHAR(50),
    bio TEXT,
    account_id UUID REFERENCES accounts(id),
    date_of_birth DATE,
    address TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_activities (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    activity_type VARCHAR(100),
    description TEXT,
    activity_date TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE user_settings (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE organizations (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(500),
    sso_provider VARCHAR(100),
    sso_client_id VARCHAR(255),
    sso_client_secret TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE departments (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE teams (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE employees (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    organization_id UUID REFERENCES organizations(id),
    department_id UUID REFERENCES departments(id),
    team_id UUID REFERENCES teams(id),
    employee_code VARCHAR(100),
    job_title VARCHAR(255),
    hire_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE categories (
    id UUID PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES categories(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    instructor_id UUID REFERENCES users(id),
    category_id UUID REFERENCES categories(id),
    organization_id UUID REFERENCES organizations(id),
    visibility VARCHAR(50) DEFAULT 'PUBLIC',
    status VARCHAR(50) DEFAULT 'DRAFT',
    duration_hours INTEGER,
    price DOUBLE PRECISION,
    rating NUMERIC(3,2),
    total_enrollments INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE course_modules (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    order_index INTEGER,
    course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE lessons (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_url TEXT,
    content_type VARCHAR(50),
    duration_minutes INTEGER,
    order_index INTEGER,
    module_id UUID REFERENCES course_modules(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE contents (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL,
    file_url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    mime_type VARCHAR(100),
    uploaded_by_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE enrollments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    status VARCHAR(50) DEFAULT 'ACTIVE',
    due_date DATE,
    enrolled_date DATE,
    completed_date DATE,
    assigned_by_id UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE learning_paths (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    organization_id UUID REFERENCES organizations(id),
    assigned_to_user_id UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE learning_path_courses (
    id UUID PRIMARY KEY,
    learning_path_id UUID REFERENCES learning_paths(id),
    course_id UUID REFERENCES courses(id),
    order_index INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE course_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    last_lesson_id UUID REFERENCES lessons(id),
    completion_percentage DOUBLE PRECISION DEFAULT 0,
    time_spent_minutes INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, course_id)
);

CREATE TABLE lesson_progress (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    lesson_id UUID REFERENCES lessons(id),
    completed BOOLEAN DEFAULT FALSE,
    time_spent_minutes INTEGER DEFAULT 0,
    completed_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    UNIQUE(user_id, lesson_id)
);

CREATE TABLE assessments (
    id UUID PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    course_id UUID REFERENCES courses(id),
    type VARCHAR(50) NOT NULL,
    passing_score INTEGER,
    time_limit_minutes INTEGER,
    max_attempts INTEGER DEFAULT 3,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE questions (
    id UUID PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    assessment_id UUID REFERENCES assessments(id),
    points INTEGER DEFAULT 1,
    order_index INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE question_options (
    id UUID PRIMARY KEY,
    question_id UUID REFERENCES questions(id),
    option_text TEXT NOT NULL,
    correct BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE assessment_results (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    assessment_id UUID REFERENCES assessments(id),
    score INTEGER,
    attempt_number INTEGER,
    passed BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE answers (
    id UUID PRIMARY KEY,
    result_id UUID REFERENCES assessment_results(id),
    question_id UUID REFERENCES questions(id),
    answer_text TEXT,
    selected_option_id UUID REFERENCES question_options(id),
    correct BOOLEAN DEFAULT FALSE,
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE certificates (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    assessment_result_id UUID REFERENCES assessment_results(id),
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(500),
    recipient_name VARCHAR(255),
    course_name VARCHAR(500),
    issuer_name VARCHAR(255),
    issued_date DATE,
    file_url TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(500) NOT NULL,
    message TEXT,
    type VARCHAR(50),
    category VARCHAR(50),
    read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    action_url TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id UUID,
    details TEXT,
    ip_address VARCHAR(50),
    created_at TIMESTAMP
);

CREATE INDEX idx_accounts_email ON accounts(email);
CREATE INDEX idx_users_account_id ON users(account_id);
CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_organization_id ON employees(organization_id);
CREATE INDEX idx_courses_instructor_id ON courses(instructor_id);
CREATE INDEX idx_courses_category_id ON courses(category_id);
CREATE INDEX idx_courses_organization_id ON courses(organization_id);
CREATE INDEX idx_enrollments_user_id ON enrollments(user_id);
CREATE INDEX idx_enrollments_course_id ON enrollments(course_id);
CREATE INDEX idx_course_progress_user_id ON course_progress(user_id);
CREATE INDEX idx_course_progress_course_id ON course_progress(course_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_certificate_number ON certificates(certificate_number);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
