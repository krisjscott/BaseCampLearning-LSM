# Base Camp Product Scope

## Product purpose

Base Camp is the primary internal learning platform for TIES. It brings structured courses, mandatory training, assessment, progress evidence, gamification, and verified certification into one system integrated with Ties HQ.

## Audiences

- Employees
- Interns and trainees
- Contractors and collaborators
- Clients enrolled in approved learning programs
- Administrators, instructors, reviewers, and compliance owners

Access, permissions, assignments, reports, and certificates must be controlled by audience type without encoding those roles into the permanent Crew ID.

## Core course structure

`Learning path → Course → Module → Lesson → Activity → Assessment → Completion → Certificate`

A course may contain video, reading, downloadable resources, quizzes, assignments, projects, and a final assessment. Prerequisites and release conditions can be applied at course, module, or lesson level.

Example catalog:

- Content Writing: Starter, Builder, and advanced paths
- Graphic Design: fundamentals through applied practice
- Project Management: a multi-course professional pathway modeled on the depth and clarity of Coursera's Google Project Management journey
- Mandatory company, policy, and compliance training

## Learner capabilities

- Sign in with email or Crew ID
- First-time profile and goal onboarding
- Assigned, mandatory, and recommended learning
- Browse and search the catalog
- Course detail, syllabus, prerequisites, outcomes, instructor, and certificate preview
- Resume learning across devices
- Non-skippable video where required
- Compulsory quizzes after designated videos
- Assignments, projects, final assessments, and retries
- Dated progress events and checkpoint history
- Reminders and deadline notifications
- Verified certificate download and sharing
- Skills profile, XP, badges, streaks, and learning levels

## Administrator capabilities

- Create, duplicate, archive, and version courses
- Define outcomes, prerequisites, modules, lessons, and sequence
- Upload video, readings, resources, and attachments
- Disable seeking or skipping and require full watch completion
- Create quizzes and design questions, answers, pass marks, feedback, timers, attempts, and retry rules
- Gate the next lesson until required conditions pass
- Preview the learner experience before publishing
- Assign courses to individuals, teams, cohorts, roles, or audience classes
- Schedule start dates, module dates, deadlines, reminders, and pacing
- Monitor progress, watch completion, scores, attempts, submissions, overdue learners, and support issues
- Apply documented overrides with an audit trail
- Approve completion, issue or revoke certificates, and export reports

## Gamification levels

| Level | XP range |
|---|---:|
| Starter | 0–999 |
| Builder | 1,000–2,499 |
| Achiever | 2,500–4,999 |
| Champion | 5,000+ |

XP should reward meaningful first-time learning events. Replaying or resubmitting the same activity must not create unlimited points.

## Certificate requirements

Each verified certificate should include:

- Learner's verified name
- Course or skill title
- Issue date
- Unique certificate number
- Issuing organization
- Verification URL or QR code
- Optional expiry or renewal date

Certificates must be downloadable as PDF, shareable as a credential, and verifiable without exposing private learner records.

## Quality and governance

- Accessibility target: WCAG 2.2 AA
- Full audit trail for publishing, assignments, overrides, results, and certificates
- Role-based access control and least-privilege administration
- Privacy controls for leaderboards and learner reporting
- Autosave and recovery for progress and submissions
- Course versioning so historical completions remain reproducible

## Out of scope for the first release

- Public marketplace and payments
- Open external instructor marketplace
- Live cohort classrooms and video conferencing
- Native mobile applications
- AI-generated grading without human-review controls

