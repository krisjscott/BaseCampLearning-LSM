CREATE SEQUENCE IF NOT EXISTS user_learner_code_seq START WITH 1 INCREMENT BY 1;

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS learner_code VARCHAR(32);

UPDATE users
SET learner_code = 'BC-CR-' || LPAD(nextval('user_learner_code_seq')::TEXT, 3, '0')
WHERE learner_code IS NULL;

ALTER TABLE users
    ALTER COLUMN learner_code SET DEFAULT ('BC-CR-' || LPAD(nextval('user_learner_code_seq')::TEXT, 3, '0')),
    ALTER COLUMN learner_code SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS users_learner_code_key ON users (learner_code);
