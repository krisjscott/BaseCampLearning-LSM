-- The learner dashboard's "Continue learning" list and the course page's
-- "last lesson" pointer both read from course_progress/lesson_progress, not
-- from enrollments - V5 only seeded an enrollment, leaving those views empty
-- for the seeded learners.
INSERT INTO course_progress (id, user_id, course_id, last_lesson_id, completion_percentage, time_spent_minutes, last_accessed_at, created_at, updated_at) VALUES
    ('e0000002-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000021', 20, 18, now(), now(), now());

INSERT INTO lesson_progress (id, user_id, lesson_id, completed, time_spent_minutes, completed_at, created_at, updated_at) VALUES
    ('e0000003-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000021', TRUE, 5, now(), now(), now());
