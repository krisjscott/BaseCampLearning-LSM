-- Phase 1: video captions
ALTER TABLE lessons ADD COLUMN captions_url VARCHAR(500);

-- Phase 3: notes, bookmarks, discussion
CREATE TABLE notes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    lesson_id UUID REFERENCES lessons(id),
    content TEXT NOT NULL,
    timestamp_seconds INTEGER,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_course_id ON notes(course_id);

CREATE TABLE bookmarks (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (user_id, lesson_id)
);
CREATE INDEX idx_bookmarks_user_id ON bookmarks(user_id);

CREATE TABLE discussion_posts (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    user_id UUID NOT NULL REFERENCES users(id),
    parent_id UUID REFERENCES discussion_posts(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_discussion_posts_course_id ON discussion_posts(course_id);

-- Phase 4: assignment submissions + contests
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY,
    lesson_id UUID NOT NULL REFERENCES lessons(id),
    user_id UUID NOT NULL REFERENCES users(id),
    submission_text TEXT,
    file_url VARCHAR(500),
    status VARCHAR(20) NOT NULL,
    score INTEGER,
    feedback TEXT,
    graded_by_id UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    UNIQUE (lesson_id, user_id)
);
CREATE INDEX idx_assignment_submissions_lesson_id ON assignment_submissions(lesson_id);

CREATE TABLE contests (
    id UUID PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    created_by_id UUID REFERENCES users(id),
    start_at TIMESTAMP NOT NULL,
    end_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);
CREATE INDEX idx_contests_course_id ON contests(course_id);
CREATE INDEX idx_contests_assessment_id ON contests(assessment_id);

-- Phase 10: seed data for local/demo testing.
-- All seeded accounts share the password "Passw0rd!123" (see README for the
-- full credential table). Hashed with pgcrypto's bf (Blowfish) scheme, which
-- produces the same $2a$ bcrypt format Spring Security's BCryptPasswordEncoder
-- verifies against.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Accounts + users -----------------------------------------------------
INSERT INTO accounts (id, email, password, role, auth_provider, email_verified, active, created_at, updated_at) VALUES
    ('a0000001-0000-0000-0000-000000000001', 'super.admin@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'SUPER_ADMIN', 'LOCAL', TRUE, TRUE, now(), now()),
    ('a0000002-0000-0000-0000-000000000001', 'org.admin@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'ORGANIZATION_ADMIN', 'LOCAL', TRUE, TRUE, now(), now()),
    ('a0000003-0000-0000-0000-000000000001', 'hr.admin@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'HR_ADMIN', 'LOCAL', TRUE, TRUE, now(), now()),
    ('a0000004-0000-0000-0000-000000000001', 'trainer@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'TRAINER', 'LOCAL', TRUE, TRUE, now(), now()),
    ('a0000005-0000-0000-0000-000000000001', 'learner.one@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'PUBLIC_USER', 'LOCAL', TRUE, TRUE, now(), now()),
    ('a0000006-0000-0000-0000-000000000001', 'learner.two@basecamp.dev', crypt('Passw0rd!123', gen_salt('bf', 10)), 'PUBLIC_USER', 'LOCAL', TRUE, TRUE, now(), now());

INSERT INTO users (id, full_name, account_id, bio, created_at, updated_at) VALUES
    ('a0000001-0000-0000-0000-000000000002', 'Sasha Root', 'a0000001-0000-0000-0000-000000000001', 'Super admin seed account for platform-wide administration testing.', now(), now()),
    ('a0000002-0000-0000-0000-000000000002', 'Owen Org', 'a0000002-0000-0000-0000-000000000001', 'Organization admin seed account.', now(), now()),
    ('a0000003-0000-0000-0000-000000000002', 'Harper HR', 'a0000003-0000-0000-0000-000000000001', 'HR admin seed account.', now(), now()),
    ('a0000004-0000-0000-0000-000000000002', 'Taylor Trainer', 'a0000004-0000-0000-0000-000000000001', 'Trainer seed account - authors the seeded course.', now(), now()),
    ('a0000005-0000-0000-0000-000000000002', 'Lee Learner', 'a0000005-0000-0000-0000-000000000001', 'Learner seed account with an active enrollment.', now(), now()),
    ('a0000006-0000-0000-0000-000000000002', 'Rae Reader', 'a0000006-0000-0000-0000-000000000001', 'Second learner seed account.', now(), now());

-- Course catalogue -------------------------------------------------------
INSERT INTO categories (id, name, description, created_at, updated_at) VALUES
    ('b0000001-0000-0000-0000-000000000001', 'Software Engineering', 'Programming, tooling, and engineering practice courses.', now(), now());

INSERT INTO courses (id, title, description, instructor_id, category_id, organization_id, visibility, status, duration_hours, price, total_enrollments, created_at, updated_at) VALUES
    ('c0000001-0000-0000-0000-000000000001', 'Full-Stack Foundations', 'A tour of the BaseCamp platform''s content types - video, markdown reading, documents, assignments, and quizzes - used as the seed course for local testing.', 'a0000004-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000001', NULL, 'PUBLIC', 'PUBLISHED', 6, 0, 2, now(), now());

INSERT INTO course_modules (id, title, description, order_index, course_id, created_at, updated_at) VALUES
    ('c0000001-0000-0000-0000-000000000011', 'Getting Started', 'Platform orientation and reading material.', 0, 'c0000001-0000-0000-0000-000000000001', now(), now()),
    ('c0000001-0000-0000-0000-000000000012', 'Practice & Assessment', 'Hands-on assignment and a graded quiz.', 1, 'c0000001-0000-0000-0000-000000000001', now(), now());

INSERT INTO lessons (id, title, description, content_url, captions_url, content_type, duration_minutes, order_index, module_id, created_at, updated_at) VALUES
    ('c0000001-0000-0000-0000-000000000021', 'Welcome & Platform Tour', 'A short welcome video with captions and an auto-generated transcript.', '/uploads/videos/seed-welcome-tour.mp4', '/uploads/captions/seed-welcome-tour.vtt', 'VIDEO', 1, 0, 'c0000001-0000-0000-0000-000000000011', now(), now()),
    ('c0000001-0000-0000-0000-000000000022', 'Markdown & LaTeX Primer', 'Reading lesson demonstrating Markdown formatting and LaTeX math rendering.', NULL, NULL, 'ARTICLE', 8, 1, 'c0000001-0000-0000-0000-000000000011', now(), now()),
    ('c0000001-0000-0000-0000-000000000023', 'Course Handbook', 'Reference document lesson for the seeded course.', NULL, NULL, 'DOCUMENT', 5, 2, 'c0000001-0000-0000-0000-000000000011', now(), now()),
    ('c0000001-0000-0000-0000-000000000024', 'Practical Exercise Submission', 'Submit a short written response or a file for instructor grading.', NULL, NULL, 'ASSIGNMENT', 20, 0, 'c0000001-0000-0000-0000-000000000012', now(), now()),
    ('c0000001-0000-0000-0000-000000000025', 'Module Quiz', 'Graded quiz covering this module - also wrapped by the seeded contest leaderboard.', NULL, NULL, 'QUIZ', 10, 1, 'c0000001-0000-0000-0000-000000000012', now(), now());

INSERT INTO reading_contents (id, title, content_markdown, estimated_reading_minutes, lesson_id, created_at, updated_at) VALUES
    ('c0000001-0000-0000-0000-000000000031', 'Markdown & LaTeX Primer', $md$# Markdown & LaTeX Primer

Lesson content on BaseCamp is authored in **Markdown**, so you can use:

- Headings, lists, and `inline code`
- [Links](https://example.com) and > blockquotes
- Fenced code blocks:

```js
function greet(name) {
  return "Hello, " + name + "!";
}
```

## Math with LaTeX

Inline math like $E = mc^2$ renders alongside text, and block equations render
on their own line:

$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
$md$, 8, 'c0000001-0000-0000-0000-000000000022', now(), now());

-- Assessment + quiz for the Module Quiz lesson / contest ----------------
INSERT INTO assessments (id, title, description, course_id, type, passing_score, time_limit_minutes, max_attempts, created_at, updated_at) VALUES
    ('d0000001-0000-0000-0000-000000000001', 'Module Quiz', 'Two-question knowledge check for the Full-Stack Foundations course.', 'c0000001-0000-0000-0000-000000000001', 'QUIZ', 70, 10, 3, now(), now());

INSERT INTO questions (id, question_text, question_type, assessment_id, points, order_index, created_at, updated_at) VALUES
    ('d0000001-0000-0000-0000-000000000011', 'Which format does the HTML5 <track> element require for captions?', 'MULTIPLE_CHOICE', 'd0000001-0000-0000-0000-000000000001', 1, 0, now(), now()),
    ('d0000001-0000-0000-0000-000000000012', 'Lesson reading content on BaseCamp is authored in which format?', 'MULTIPLE_CHOICE', 'd0000001-0000-0000-0000-000000000001', 1, 1, now(), now());

INSERT INTO question_options (id, question_id, option_text, correct, created_at, updated_at) VALUES
    ('d0000001-0000-0000-0000-000000000021', 'd0000001-0000-0000-0000-000000000011', 'WebVTT', TRUE, now(), now()),
    ('d0000001-0000-0000-0000-000000000022', 'd0000001-0000-0000-0000-000000000011', 'SRT', FALSE, now(), now()),
    ('d0000001-0000-0000-0000-000000000023', 'd0000001-0000-0000-0000-000000000011', 'ASS', FALSE, now(), now()),
    ('d0000001-0000-0000-0000-000000000031', 'd0000001-0000-0000-0000-000000000012', 'Markdown', TRUE, now(), now()),
    ('d0000001-0000-0000-0000-000000000032', 'd0000001-0000-0000-0000-000000000012', 'Raw HTML only', FALSE, now(), now());

-- Enrollments + one submitted quiz attempt (feeds the contest leaderboard)
INSERT INTO enrollments (id, user_id, course_id, status, enrolled_date, created_at, updated_at) VALUES
    ('e0000001-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'ACTIVE', CURRENT_DATE, now(), now()),
    ('e0000001-0000-0000-0000-000000000002', 'a0000006-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'ACTIVE', CURRENT_DATE, now(), now());

INSERT INTO assessment_results (id, user_id, assessment_id, score, attempt_number, passed, submitted_at, created_at, updated_at) VALUES
    ('d0000002-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000001', 100, 1, TRUE, now(), now(), now());

INSERT INTO contests (id, title, description, assessment_id, course_id, created_by_id, start_at, end_at, created_at, updated_at) VALUES
    ('f0000001-0000-0000-0000-000000000001', 'Quiz Sprint Challenge', 'Time-boxed leaderboard wrapping the Module Quiz - highest score wins.', 'd0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002', '2026-01-01 00:00:00', '2030-01-01 00:00:00', now(), now());

-- Notes, bookmarks, discussion, and an assignment submission awaiting grading
INSERT INTO notes (id, user_id, course_id, lesson_id, content, timestamp_seconds, created_at, updated_at) VALUES
    ('a0000007-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000021', 'Remember: the platform tour covers the dashboard first, then course content.', 3, now(), now()),
    ('a0000007-0000-0000-0000-000000000002', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000022', 'The block LaTeX example uses \int - come back and try changing the bounds.', NULL, now(), now());

INSERT INTO bookmarks (id, user_id, course_id, lesson_id, created_at, updated_at) VALUES
    ('a0000008-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000022', now(), now());

INSERT INTO discussion_posts (id, course_id, user_id, parent_id, content, created_at, updated_at) VALUES
    ('a0000009-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', NULL, 'Loving the new Markdown lessons - is LaTeX supported in every reading lesson?', now(), now()),
    ('a0000009-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002', 'a0000009-0000-0000-0000-000000000001', 'Yes! Any ARTICLE-type lesson supports LaTeX via $...$ (inline) or $$...$$ (block) syntax.', now(), now());

INSERT INTO assignment_submissions (id, lesson_id, user_id, submission_text, status, created_at, updated_at) VALUES
    ('a000000a-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000024', 'a0000005-0000-0000-0000-000000000002', 'Here is my submission for the practical exercise - the transcript feature was the trickiest part to get right.', 'SUBMITTED', now(), now());
