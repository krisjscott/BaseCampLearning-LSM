INSERT INTO accounts (id, email, password, role, auth_provider, email_verified, user_id, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', 'demo@basecamp.local', '$2a$10$ZrMCJhVP5mwkattDlvpyTOY1Dsm8LcQLu58ugyivqOPfr3gSJVQt.', 'PUBLIC_USER', 'LOCAL', TRUE, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO users (id, full_name, profile_picture_url, phone, bio, account_id, date_of_birth, address, created_at, updated_at)
VALUES
('22222222-2222-2222-2222-222222222222', 'Ahan Demo', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=320&q=80', '+91 90000 00000', 'Learning product demo profile connected to the local BaseCamp backend.', '11111111-1111-1111-1111-111111111111', DATE '1999-02-14', 'Kolkata, India', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_settings (id, user_id, email_notifications, push_notifications, language, timezone, created_at, updated_at)
VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', TRUE, TRUE, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO organizations (id, name, description, logo_url, website, active, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444444', 'BaseCamp Academy', 'A local demo organization for the BaseCamp learning platform.', 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=320&q=80', 'https://basecamp.local', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO categories (id, name, description, parent_id, created_at, updated_at)
VALUES
('55555555-5555-5555-5555-555555555551', 'Product', 'Product strategy, research, and launch craft.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555552', 'Engineering', 'Modern software engineering and delivery.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('55555555-5555-5555-5555-555555555553', 'Leadership', 'Communication, execution, and team operating systems.', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO courses (id, title, description, thumbnail_url, instructor_id, category_id, organization_id, visibility, status, duration_hours, price, rating, total_enrollments, created_at, updated_at)
VALUES
('66666666-6666-6666-6666-666666666661', 'Product Discovery Sprint', 'Learn how to turn messy ideas into validated product bets with interviews, mapping, and prototype tests.', 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555551', '44444444-4444-4444-4444-444444444444', 'PUBLIC', 'PUBLISHED', 6, 0, 4.80, 1280, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('66666666-6666-6666-6666-666666666662', 'Frontend Systems That Scale', 'Build durable component systems, data states, and UI flows without losing visual polish.', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555552', '44444444-4444-4444-4444-444444444444', 'PUBLIC', 'PUBLISHED', 9, 0, 4.90, 2140, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('66666666-6666-6666-6666-666666666663', 'Manager Operating Rhythm', 'Create clear weekly rituals for planning, feedback, decision logs, and async execution.', 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80', '22222222-2222-2222-2222-222222222222', '55555555-5555-5555-5555-555555555553', '44444444-4444-4444-4444-444444444444', 'PUBLIC', 'PUBLISHED', 4, 0, 4.70, 860, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO course_modules (id, title, description, order_index, course_id, created_at, updated_at)
VALUES
('77777777-7777-7777-7777-777777777771', 'Frame the Opportunity', 'Define the user, pain, promise, and success signal.', 1, '66666666-6666-6666-6666-666666666661', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777772', 'Prototype the Flow', 'Move from assumptions to a testable product path.', 2, '66666666-6666-6666-6666-666666666661', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777773', 'Ship the UI System', 'Connect visual decisions to reusable implementation pieces.', 1, '66666666-6666-6666-6666-666666666662', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO lessons (id, title, description, content_url, content_type, duration_minutes, order_index, module_id, created_at, updated_at)
VALUES
('88888888-8888-8888-8888-888888888881', 'Interview Notes to Opportunity Map', 'Turn five raw conversations into patterns the team can act on.', '/demo/lessons/opportunity-map', 'ARTICLE', 22, 1, '77777777-7777-7777-7777-777777777771', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('88888888-8888-8888-8888-888888888882', 'Prototype Critique Loop', 'Use structured critique to sharpen the product path before build.', '/demo/lessons/prototype-loop', 'VIDEO', 31, 1, '77777777-7777-7777-7777-777777777772', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('88888888-8888-8888-8888-888888888883', 'Stateful Design Tokens', 'Keep color, spacing, and interaction states coherent across screens.', '/demo/lessons/design-tokens', 'ARTICLE', 26, 1, '77777777-7777-7777-7777-777777777773', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO enrollments (id, user_id, course_id, status, due_date, enrolled_date, completed_date, assigned_by_id, created_at, updated_at)
VALUES
('99999999-9999-9999-9999-999999999991', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666661', 'ACTIVE', CURRENT_DATE + 21, CURRENT_DATE - 8, NULL, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('99999999-9999-9999-9999-999999999992', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666662', 'ACTIVE', CURRENT_DATE + 35, CURRENT_DATE - 3, NULL, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('99999999-9999-9999-9999-999999999993', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666663', 'COMPLETED', CURRENT_DATE - 1, CURRENT_DATE - 18, CURRENT_DATE - 2, '22222222-2222-2222-2222-222222222222', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO course_progress (id, user_id, course_id, last_lesson_id, completion_percentage, time_spent_minutes, last_accessed_at, created_at, updated_at)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666661', '88888888-8888-8888-8888-888888888882', 58.0, 184, CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666662', '88888888-8888-8888-8888-888888888883', 24.0, 72, CURRENT_TIMESTAMP - INTERVAL '1' DAY, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666663', NULL, 100.0, 240, CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO user_activities (id, user_id, activity_type, description, activity_date, created_at, updated_at)
VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1', '22222222-2222-2222-2222-222222222222', 'COURSE_PROGRESS', 'Continued Product Discovery Sprint and completed prototype critique.', CURRENT_TIMESTAMP - INTERVAL '2' HOUR, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2', '22222222-2222-2222-2222-222222222222', 'CERTIFICATE_READY', 'Earned the Manager Operating Rhythm certificate.', CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb3', '22222222-2222-2222-2222-222222222222', 'COURSE_STARTED', 'Started Frontend Systems That Scale.', CURRENT_TIMESTAMP - INTERVAL '3' DAY, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO certificates (id, user_id, course_id, assessment_result_id, certificate_number, title, recipient_name, course_name, issuer_name, issued_date, file_url, created_at, updated_at)
VALUES
('cccccccc-cccc-cccc-cccc-ccccccccccc1', '22222222-2222-2222-2222-222222222222', '66666666-6666-6666-6666-666666666663', NULL, 'BC-DEMO-2026-001', 'Certificate of Completion', 'Ahan Demo', 'Manager Operating Rhythm', 'BaseCamp Academy', CURRENT_DATE - 2, '/certificates/BC-DEMO-2026-001.pdf', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

INSERT INTO notifications (id, user_id, title, message, type, category, read, read_at, action_url, created_at, updated_at)
VALUES
('dddddddd-dddd-dddd-dddd-ddddddddddd1', '22222222-2222-2222-2222-222222222222', 'Certificate ready', 'Your Manager Operating Rhythm certificate is ready to view.', 'IN_APP', 'CERTIFICATE_READY', FALSE, NULL, '/certificates', CURRENT_TIMESTAMP - INTERVAL '2' DAY, CURRENT_TIMESTAMP),
('dddddddd-dddd-dddd-dddd-ddddddddddd2', '22222222-2222-2222-2222-222222222222', 'New module unlocked', 'Frontend Systems That Scale now has a new implementation module.', 'IN_APP', 'COURSE_ASSIGNED', FALSE, NULL, '/my-learning', CURRENT_TIMESTAMP - INTERVAL '1' DAY, CURRENT_TIMESTAMP),
('dddddddd-dddd-dddd-dddd-ddddddddddd3', '22222222-2222-2222-2222-222222222222', 'Deadline reminder', 'Product Discovery Sprint is due in three weeks.', 'IN_APP', 'DEADLINE_REMINDER', TRUE, CURRENT_TIMESTAMP - INTERVAL '4' HOUR, '/learning', CURRENT_TIMESTAMP - INTERVAL '4' HOUR, CURRENT_TIMESTAMP);
