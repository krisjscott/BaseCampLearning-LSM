-- Production-only cleanup for the local/demo dataset created by V5 and V7.
-- Defensive version: removes demo rows by course, assessment, lesson, and user relationships.

DELETE FROM answers
WHERE result_id IN (
    SELECT id
    FROM assessment_results
    WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid
    )
   OR question_id IN (
SELECT id
FROM questions
WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid
    );

DELETE FROM assessment_results
WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid
   OR user_id IN (
    'a0000001-0000-0000-0000-000000000002'::uuid,
    'a0000002-0000-0000-0000-000000000002'::uuid,
    'a0000003-0000-0000-0000-000000000002'::uuid,
    'a0000004-0000-0000-0000-000000000002'::uuid,
    'a0000005-0000-0000-0000-000000000002'::uuid,
    'a0000006-0000-0000-0000-000000000002'::uuid
);

DELETE FROM question_options
WHERE question_id IN (
    SELECT id
    FROM questions
    WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid
    );

DELETE FROM questions
WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM contests
WHERE assessment_id = 'd0000001-0000-0000-0000-000000000001'::uuid
   OR course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM assessments
WHERE id = 'd0000001-0000-0000-0000-000000000001'::uuid
   OR course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM assignment_submissions
WHERE lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
    );

DELETE FROM discussion_posts
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM bookmarks
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
   OR lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
);

DELETE FROM notes
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
   OR lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
);

DELETE FROM lesson_progress
WHERE lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
    );

DELETE FROM course_progress
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
   OR last_lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
);

-- Delete certificates & templates tied to the demo course
DELETE FROM certificates
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM certificate_templates
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

-- UPDATED: Delete enrollments by course_id OR by any demo user reference (user_id / assigned_by_id)
DELETE FROM enrollments
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
   OR user_id IN (
    'a0000001-0000-0000-0000-000000000002'::uuid,
    'a0000002-0000-0000-0000-000000000002'::uuid,
    'a0000003-0000-0000-0000-000000000002'::uuid,
    'a0000004-0000-0000-0000-000000000002'::uuid,
    'a0000005-0000-0000-0000-000000000002'::uuid,
    'a0000006-0000-0000-0000-000000000002'::uuid
)
   OR assigned_by_id IN (
    'a0000001-0000-0000-0000-000000000002'::uuid,
    'a0000002-0000-0000-0000-000000000002'::uuid,
    'a0000003-0000-0000-0000-000000000002'::uuid,
    'a0000004-0000-0000-0000-000000000002'::uuid,
    'a0000005-0000-0000-0000-000000000002'::uuid,
    'a0000006-0000-0000-0000-000000000002'::uuid
);

DELETE FROM reading_contents
WHERE lesson_id IN (
    SELECT id
    FROM lessons
    WHERE module_id IN (
        SELECT id
        FROM course_modules
        WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    )
    );

DELETE FROM lessons
WHERE module_id IN (
    SELECT id
    FROM course_modules
    WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid
    );

DELETE FROM course_modules
WHERE course_id = 'c0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM courses WHERE id = 'c0000001-0000-0000-0000-000000000001'::uuid;
DELETE FROM categories WHERE id = 'b0000001-0000-0000-0000-000000000001'::uuid;

DELETE FROM user_activities WHERE user_id IN ('a0000001-0000-0000-0000-000000000002'::uuid, 'a0000002-0000-0000-0000-000000000002'::uuid, 'a0000003-0000-0000-0000-000000000002'::uuid, 'a0000004-0000-0000-0000-000000000002'::uuid, 'a0000005-0000-0000-0000-000000000002'::uuid, 'a0000006-0000-0000-0000-000000000002'::uuid);
DELETE FROM user_settings WHERE user_id IN ('a0000001-0000-0000-0000-000000000002'::uuid, 'a0000002-0000-0000-0000-000000000002'::uuid, 'a0000003-0000-0000-0000-000000000002'::uuid, 'a0000004-0000-0000-0000-000000000002'::uuid, 'a0000005-0000-0000-0000-000000000002'::uuid, 'a0000006-0000-0000-0000-000000000002'::uuid);
DELETE FROM users WHERE id IN ('a0000001-0000-0000-0000-000000000002'::uuid, 'a0000002-0000-0000-0000-000000000002'::uuid, 'a0000003-0000-0000-0000-000000000002'::uuid, 'a0000004-0000-0000-0000-000000000002'::uuid, 'a0000005-0000-0000-0000-000000000002'::uuid, 'a0000006-0000-0000-0000-000000000002'::uuid);
DELETE FROM accounts WHERE id IN ('a0000001-0000-0000-0000-000000000001'::uuid, 'a0000002-0000-0000-0000-000000000001'::uuid, 'a0000003-0000-0000-0000-000000000001'::uuid, 'a0000004-0000-0000-0000-000000000001'::uuid, 'a0000005-0000-0000-0000-000000000001'::uuid, 'a0000006-0000-0000-0000-000000000001'::uuid);