ALTER TABLE accounts ADD COLUMN active BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE reading_contents ADD CONSTRAINT reading_contents_lesson_id_key UNIQUE (lesson_id);
