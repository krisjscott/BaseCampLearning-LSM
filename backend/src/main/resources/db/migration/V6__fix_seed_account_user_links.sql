-- V5's seed data set users.account_id but never set the reverse pointer
-- accounts.user_id, which AuthContext.currentUserId() relies on - this broke
-- every self-scoped endpoint (enrollments, notes, bookmarks, submissions...)
-- for all 6 seeded accounts.
UPDATE accounts SET user_id = 'a0000001-0000-0000-0000-000000000002' WHERE id = 'a0000001-0000-0000-0000-000000000001';
UPDATE accounts SET user_id = 'a0000002-0000-0000-0000-000000000002' WHERE id = 'a0000002-0000-0000-0000-000000000001';
UPDATE accounts SET user_id = 'a0000003-0000-0000-0000-000000000002' WHERE id = 'a0000003-0000-0000-0000-000000000001';
UPDATE accounts SET user_id = 'a0000004-0000-0000-0000-000000000002' WHERE id = 'a0000004-0000-0000-0000-000000000001';
UPDATE accounts SET user_id = 'a0000005-0000-0000-0000-000000000002' WHERE id = 'a0000005-0000-0000-0000-000000000001';
UPDATE accounts SET user_id = 'a0000006-0000-0000-0000-000000000002' WHERE id = 'a0000006-0000-0000-0000-000000000001';
