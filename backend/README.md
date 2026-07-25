# Backend Specification and Status

## Status

No production Base Camp backend has been implemented yet. The previous local UI project included Drizzle and Cloudflare bindings, but its database schema was empty. This directory documents the approved backend boundary without presenting starter code as finished work.

## Recommended services

- Identity and access
- People and organizations
- Catalog and course authoring
- Assignments and enrollments
- Media and resource storage
- Progress and event ledger
- Assessment and grading
- Completion rules
- Certificate issuance and verification
- Notifications
- Reporting and audit

These can begin as modules in a modular monolith and separate later only when scale or ownership justifies it.

## Core entities

- `users`
- `crew_id_sequences`
- `organizations`
- `memberships`
- `roles` and `permissions`
- `courses` and `course_versions`
- `modules`
- `lessons`
- `activities`
- `resources`
- `assignments`
- `enrollments`
- `video_watch_sessions`
- `progress_events`
- `quizzes`, `questions`, and `answer_options`
- `quiz_attempts` and `responses`
- `submissions` and `reviews`
- `completion_rules`
- `certificates`
- `xp_ledger`, `badges`, and `streaks`
- `notifications`
- `audit_events`

## Integrity rules

- Published course versions are immutable.
- Unlocking and completion are calculated server-side.
- Video completion uses verified watch intervals, not only a client-reported percentage.
- Assessment attempts are append-only.
- Progress is an event ledger with derived summaries.
- XP is ledger-based and idempotent.
- Certificate numbers are unique and permanent.
- Revoked certificates remain verifiable as revoked.
- Privileged actions create immutable audit events.

## API surface

Initial API groups:

- `/auth` and `/sessions`
- `/users`, `/crew-ids`, and `/organizations`
- `/catalog`, `/courses`, `/course-versions`, `/modules`, and `/lessons`
- `/assignments` and `/enrollments`
- `/media`, `/watch-sessions`, and `/progress`
- `/quizzes`, `/attempts`, `/submissions`, and `/reviews`
- `/completions` and `/certificates`
- `/xp`, `/badges`, and `/achievements`
- `/notifications`
- `/admin/reports` and `/admin/audit`

## Non-functional requirements

- Transactional Crew ID and certificate allocation
- Idempotency keys for progress, grading, XP, and certificate operations
- Encryption in transit and at rest
- Least-privilege authorization on every server operation
- Signed, time-limited media access
- Malware scanning for uploads
- Rate limiting and abuse prevention
- Structured logs, metrics, tracing, backups, and tested restoration
- Data export and retention controls

