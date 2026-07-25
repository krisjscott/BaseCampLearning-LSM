# Administrator Flow

## A. Course builder

### Plan course

`Course details → Define outcomes → Create modules → Order lessons → Set prerequisites`

The administrator defines ownership, audience, level, estimated workload, objectives, version, completion policy, and certificate eligibility before adding content.

### Build learning

1. Add a lesson.
2. Select video, reading, resource, quiz, assignment, or project.
3. Upload or author the material.
4. Configure completion evidence.
5. For protected video, disable skipping and require the configured full-watch threshold.

### Add compulsory quiz

`Create quiz → Choose question types → Set answers and feedback → Set pass mark → Set retry rules → Lock next lesson`

Question design supports single choice, multiple choice, true/false, ordering, matching, short answer, and scenario questions. Each quiz stores attempt limits, timers, randomization, feedback rules, and accessibility requirements.

### Review and publish

1. Preview the complete learner view.
2. Validate missing content, broken links, accessibility, grading, and gating.
3. Request review or revise.
4. Publish an immutable course version.
5. Future edits create a new draft/version rather than rewriting historical completions.

## B. Delivery and control

### Plan learner access

`Choose audience → Individual or group assignment → Check prerequisites`

Assignments may target an individual, team, cohort, department, role, or audience class. Exceptions must be explicit and auditable.

### Configure delivery

`Start date → Module dates → Completion date → Reminders → Pacing`

Pacing may be self-paced, scheduled, or drip-released. Dates are stored with timezone and change history.

### Control progression

`Assign → Release module → Verify video completion → Unlock quiz → Verify pass → Unlock next lesson`

The server, not the browser, must determine completion and unlocking.

### Monitor learners

The administrator dashboard includes:

- Enrollment and start rate
- Progress by learner, cohort, and course
- Verified watch completion
- Quiz scores, attempts, and item-level performance
- Submission status and reviewer backlog
- Overdue or inactive learners
- Completion and certificate rates
- Support and accessibility exceptions

Administrators may send reminders or apply authorized overrides. Every override records actor, reason, time, previous value, and new value.

### Complete and certify

`Verify conditions → Approve if required → Issue certificate → Update record → Export report`

Certificate revocation, correction, expiry, and reissue remain available after completion with a permanent audit trail.

## Roles

| Role | Main authority |
|---|---|
| Super Admin | Organization settings, roles, security, and all records |
| Learning Admin | Catalog, courses, assignments, reporting, certificates |
| Course Author | Draft and edit owned courses |
| Reviewer | Approve content and course versions |
| Instructor | Announcements, learner support, grading, feedback |
| Manager | View assigned team progress within policy |
| Certificate Officer | Issue, correct, revoke, and audit credentials |
| Support Agent | Troubleshoot accounts and learning records with restricted access |

