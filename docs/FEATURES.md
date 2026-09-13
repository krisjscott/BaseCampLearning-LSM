# BaseCamp — Feature Inventory & Roadmap

> **Last updated:** September 2026
>
> This document catalogs every feature currently implemented in BaseCamp and proposes potential additions for future development.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Architecture & Tech Stack](#2-architecture--tech-stack)
- [3. Existing Features — Backend](#3-existing-features--backend)
- [4. Existing Features — Learner Frontend](#4-existing-features--learner-frontend)
- [5. Existing Features — Admin Console](#5-existing-features--admin-console)
- [6. Security & Compliance](#6-security--compliance)
- [7. DevOps & Infrastructure](#7-devops--infrastructure)
- [8. Potential Future Features](#8-potential-future-features)

---

## 1. Project Overview

BaseCamp is a full-stack **learning management and certification platform** built for TIES (TiesVerse). It provides structured courses, mandatory training, assessments, progress tracking, gamification, and verified certification — all in one system.

| Component | Technology | Port |
|---|---|---|
| **Backend API** | Spring Boot 3 / Java 21 | `8081` |
| **Learner Frontend** | Next.js (React / TypeScript) | `3100` |
| **Admin Console** | Next.js (React / TypeScript) | `3101` |
| **Database** | PostgreSQL (via Flyway migrations) | — |
| **Object Storage** | Cloudflare R2 (S3-compatible) | — |

---

## 2. Architecture & Tech Stack

### Backend

- **Framework:** Spring Boot 3 with Java 21
- **Build Tool:** Maven (with Maven Wrapper)
- **Database:** PostgreSQL with Flyway managed migrations (12+ migrations)
- **Authentication:** JWT (access + refresh tokens with type claims)
- **OAuth:** Google Sign-In via Spring Security OAuth2
- **API Docs:** Swagger UI / SpringDoc OpenAPI
- **Storage:** Cloudflare R2 (S3-compatible) with local fallback
- **Email:** SMTP integration for email verification and password resets
- **Captcha:** Cloudflare Turnstile integration
- **PDF Generation:** Apache PDFBox for certificate rendering
- **Dependency Injection:** Spring IoC with profile-based configuration (`dev`, `prod`, `cloud`)

### Frontend (Learner + Admin)

- **Framework:** Next.js (latest) with TypeScript
- **UI Icons:** Lucide React
- **Markdown Rendering:** `react-markdown` + `remark-math` + `rehype-katex` (LaTeX support)
- **PDF Viewing (Admin):** `react-pdf`
- **Deployment:** Cloudflare Workers via `@opennextjs/cloudflare` + Wrangler
- **Font Strategy:** System font stack (no external font dependencies)

---

## 3. Existing Features — Backend

### 3.1 Authentication & Identity

| Feature | Details |
|---|---|
| **Email/Password Registration** | Full signup flow with form validation |
| **Email Verification** | OTP-based email verification after registration |
| **Login** | JWT-based authentication with access + refresh tokens |
| **Token Refresh** | Secure refresh token rotation with hashed storage and single-use enforcement |
| **Google OAuth Sign-In** | Full OAuth2 flow with one-time exchange codes, `email_verified` check, and account linking |
| **Password Reset** | Hashed, expiring, one-time password reset tokens delivered via email |
| **Password Change** | Authenticated in-app password change for all roles |
| **Logout** | Invalidates refresh token (hash-based) |
| **Timing-safe Login** | Dummy BCrypt comparison on unknown emails prevents timing-based enumeration |

### 3.2 Role-Based Access Control

| Role | Scope |
|---|---|
| `PUBLIC_USER` | Learner — access to courses, progress, notes, bookmarks, certificates |
| `HR_ADMIN` | Course authoring, learner management, assignment grading |
| `ORGANIZATION_ADMIN` | Full org-scoped admin (when organization tenancy is activated) |
| `SUPER_ADMIN` | Platform-wide administration |

- Path-level security via `SecurityConfig` (`/api/v1/admin/**` requires admin roles)
- Per-endpoint authorization for defense in depth
- Organization-scoped tenancy infrastructure (built, ships inactive — activate by assigning `organizationId` to admin accounts)

### 3.3 Course Management

| Feature | Details |
|---|---|
| **Categories** | Organize courses into browsable categories |
| **Courses** | Full CRUD — create, update, archive courses with metadata |
| **Modules** | Organize course content into ordered modules |
| **Lessons** | Five content types: `VIDEO`, `ARTICLE`, `DOCUMENT`, `ASSIGNMENT`, `QUIZ` |
| **Reading Content** | Markdown + LaTeX-rendered articles (via `reading_contents` table) |
| **Video Lessons** | Server-validated uploads with configurable format/size rules (`VideoRules`) |
| **Captions/Subtitles** | `.vtt`/`.srt` upload with automatic WebVTT normalization (`SubtitleConverter`) |
| **Document Lessons** | Downloadable resource attachments |
| **Course Search** | Search courses and content via the `/search` endpoint |

### 3.4 Assessments & Quizzes

| Feature | Details |
|---|---|
| **Assessment CRUD** | Create quizzes with questions, answer options, and pass marks |
| **Quiz Submission** | Learner quiz submission and auto-grading |
| **Assessment Results** | Score recording, attempt tracking, pass/fail determination |
| **Quiz Review** | Learners can review submitted answers |
| **Retry Support** | Configurable retry/retake policies |

### 3.5 Contests & Leaderboards

| Feature | Details |
|---|---|
| **Contest Creation** | Time-boxed contests wrapping existing assessments |
| **Live Leaderboard** | Derived in real-time from `AssessmentResult` rows — best score per user, earliest submission as tiebreak |
| **Active Contest Lookup** | Filter active contests by course |

### 3.6 Assignments

| Feature | Details |
|---|---|
| **Submission** | Multipart file + text submissions per lesson |
| **My Submission** | Learners can view their own submission |
| **Admin Grading** | Admin-side grading interface for assignment submissions |

### 3.7 Enrollment & Progress

| Feature | Details |
|---|---|
| **Course Enrollment** | Self-enrollment and admin-assigned enrollment |
| **Enrollment Status** | Admin-managed enrollment status transitions |
| **Course Progress** | Percentage-based course completion tracking |
| **Lesson Progress** | Per-lesson completion tracking |
| **Continue Learning** | Dashboard-powered resume functionality |
| **Learning Paths** | Structured course sequences |

### 3.8 Engagement Features

| Feature | Details |
|---|---|
| **Notes** | Full CRUD per-lesson personal notes (scoped to authenticated user) |
| **Bookmarks** | Add/remove bookmarks on lessons |
| **Discussion Threads** | Course-level discussions with one level of reply nesting |
| **Discussion Moderation** | Users delete own posts; admins can delete any post |

### 3.9 Certificates

| Feature | Details |
|---|---|
| **Certificate Issuance** | Automatic on course completion |
| **Certificate Verification** | Public endpoint (`/certificates/verify/{number}`) — 128-bit `SecureRandom` certificate numbers |
| **Certificate Templates** | Admin-uploadable, per-course certificate templates |
| **Template Layout** | Customizable certificate layout with save/preview |
| **PDF Generation** | Server-side PDF rendering via Apache PDFBox (no HTML/template-engine injection surface) |
| **Credential Sharing** | Verification URL for public credential validation |

### 3.10 Notifications

| Feature | Details |
|---|---|
| **In-App Notifications** | Notification feed for learners |
| **Notification Management** | Read/unread tracking, mark-as-read |

### 3.11 Analytics & Dashboard

| Feature | Details |
|---|---|
| **Learner Dashboard** | Aggregated personal stats — progress, recent activity, continue learning |
| **Admin Dashboard** | Platform-wide analytics and metrics |
| **Analytics Endpoints** | Aggregated statistics for reporting |

### 3.12 Organization Directory

| Feature | Details |
|---|---|
| **Organizations** | Organization entities with departments, teams, and employees |
| **Status** | Backend API available; no longer surfaced in the admin UI |

### 3.13 File Storage

| Feature | Details |
|---|---|
| **Cloudflare R2** | S3-compatible object storage for production uploads |
| **Local Fallback** | `backend/uploads/` for development and seed data |
| **Upload Proxy** | Backend proxies `/uploads/**` reads — frontend never receives R2 credentials |
| **Extension Allowlisting** | Per-subdirectory allowlists (videos: mp4/webm/mov; documents: office/PDF/image types) |
| **Security** | Path-traversal sanitization, executable extension blocking, `Content-Disposition: attachment` for non-media |
| **Authenticated Access** | Documents and submissions require authentication; submissions additionally check ownership |

### 3.14 Audit Logging

| Feature | Details |
|---|---|
| **Audit Trail** | Every admin mutation writes an `AuditLog` row |
| **Audit Log Viewer** | Admin-accessible audit log with filtering |

### 3.15 User Management

| Feature | Details |
|---|---|
| **User Profiles** | User settings, display name, profile picture (from Google OAuth or manual) |
| **Learner Code** | Auto-generated learner code (`BC-CR-###`) |
| **User Settings** | Preferences and profile management |
| **Admin Account CRUD** | Create, update, activate/deactivate admin accounts |

---

## 4. Existing Features — Learner Frontend

### 4.1 Authentication Pages

| Page | Features |
|---|---|
| **Login / Home** (`/`) | Email + password login, Google OAuth button |
| **OTP Verification** (`/otp-verify`) | Email verification code input |
| **Recover Access** (`/recover-access`) | Password reset request and new password form |
| **OAuth Callback** (`/oauth/callback`) | One-time exchange code handler with Strict Mode guard |
| **Onboarding** (`/onboarding`) | First-time profile setup — name, goals, phone number, learning commitment |

### 4.2 Learning Hub

| Page | Features |
|---|---|
| **Learning Home** (`/learning`) | Continue learning, mandatory courses, assigned courses, recommended paths, XP/level/streak display |
| **My Learning** (`/my-learning`) | Enrolled courses list, in-progress and completed tabs |
| **My Learning Empty** (`/my-learning-empty`) | Empty-state UI when no courses enrolled |
| **Mandatory Learning** (`/mandatory-learning`) | Mandatory course assignments with deadlines |
| **Learning Calendar** (`/learning-calendar`) | Calendar view of learning schedule and deadlines |

### 4.3 Course Discovery

| Page | Features |
|---|---|
| **Explore** (`/explore`) | Browse full course catalog |
| **Category View** (`/category/business-management`) | Category-filtered course listings |
| **Search Results** (`/search-results`) | Course/content search with results display |
| **Course Detail** (`/course`) | Syllabus, modules, outcomes, prerequisites, instructor info, certificate preview, enrollment CTA |

### 4.4 Lesson Player

| Page | Features |
|---|---|
| **Lesson Player** (`/lesson`) | Unified player for all lesson types — video playback, caption display, progress tracking |
| **Reading Lesson** (`/reading-lesson`) | Markdown + LaTeX rendered articles |
| **Assignment Submission** (`/assignment-submission`) | File + text submission form |

### 4.5 Assessment

| Page | Features |
|---|---|
| **Quiz** (`/quiz`) | Timed/untimed quiz interface, question navigation, auto-save |
| **Quiz Result** (`/quiz-result`) | Score, pass/fail status, certificate unlock notification |
| **Quiz Result Retake** (`/quiz-result-retake-required`) | Failed quiz UI with retake instructions |
| **Quiz Review** (`/quiz-review`) | Review submitted answers with correct/incorrect feedback |

### 4.6 Progress & Achievements

| Page | Features |
|---|---|
| **Progress** (`/progress`) | Detailed course + lesson progress breakdown |
| **Achievements** (`/achievements`) | XP, badges, streaks, learning levels |
| **Certificate Progress** (`/certificate-progress`) | Certificate eligibility tracking |
| **Certificates** (`/certificates`) | Earned certificates list |
| **Certificate Detail** (`/certificate-detail`) | Individual certificate view with download/share |
| **Verify Credential** (`/verify-credential`) | Public certificate verification |

### 4.7 Engagement

| Page | Features |
|---|---|
| **Notes & Bookmarks** (`/notes-bookmarks`) | Personal notes manager, bookmark browser |
| **Course Discussion** (`/course-discussion`) | Course-level discussion threads with reply nesting |
| **Notifications** (`/notifications`) | In-app notification feed |

### 4.8 User Settings

| Page | Features |
|---|---|
| **Profile & Preferences** (`/profile-preferences`) | Profile editing, preferences management |
| **Help & Support** (`/help-support`) | Support information and contact options |

### 4.9 Additional Pages

| Page | Features |
|---|---|
| **Learning Path** (`/path/project-management`) | Structured multi-course pathway view |

### 4.10 Cross-Cutting Frontend Features

- **JWT Auth Middleware** — route protection, token refresh, redirect to login
- **API Proxy** — Next.js rewrites proxy `/api/v1/**` and `/uploads/**` to backend
- **Markdown/LaTeX Rendering** — `react-markdown` + `remark-math` + `rehype-katex` (no `rehype-raw` — XSS-safe)
- **HTML Sanitization** — Iterative queue-based sanitizer with URL-scheme allowlisting
- **Responsive Design** — Mobile-first responsive CSS
- **Cloudflare Workers Deployment** — via `@opennextjs/cloudflare`

---

## 5. Existing Features — Admin Console

### 5.1 Authentication

| Page | Features |
|---|---|
| **Login** (`/login`) | Admin-specific login page |
| **Recover Access** (`/recover-access`) | Admin password reset |

### 5.2 Dashboard

| Page | Features |
|---|---|
| **Dashboard** (`/`) | Platform-wide analytics overview — active learners, courses, enrollments, completions |

### 5.3 Course Authoring

| Page | Features |
|---|---|
| **Courses** (`/courses`) | Course listing, creation, editing, module/lesson management |
| **Lesson Editor** | Create/edit lessons for all 5 types (VIDEO, ARTICLE, DOCUMENT, ASSIGNMENT, QUIZ) |
| **Video Upload** | Upload lesson videos with configurable `VideoRules` (allowed formats, max size) |
| **Caption Upload** | Upload `.vtt`/`.srt` captions with automatic WebVTT normalization |
| **Reading Content Editor** | Markdown + LaTeX content authoring for ARTICLE lessons |
| **Assignment Grading** | View and grade learner assignment submissions |

### 5.4 Assessment Management

| Page | Features |
|---|---|
| **Quizzes** (`/quizzes`) | Quiz creation, question/option management, pass mark configuration |
| **Contest Management** | Create/manage time-boxed contests wrapping assessments |

### 5.5 User & Account Management

| Page | Features |
|---|---|
| **Learners** (`/learners`) | Learner directory — view, search, and manage learner accounts |
| **Admins** (`/admins`) | Admin account CRUD — create, edit, activate/deactivate admin accounts |

### 5.6 Certificate Management

| Page | Features |
|---|---|
| **Certificate Template** (`/certificate-template`) | Upload, preview, and manage per-course certificate templates and layouts |

### 5.7 Platform Administration

| Page | Features |
|---|---|
| **Settings** (`/settings`) | Platform settings, video rules configuration, admin password change |
| **Audit Log** (`/audit-log`) | Full audit trail — every admin action with timestamps and details |

### 5.8 Cross-Cutting Admin Features

- **Admin Auth Middleware** — role-gated route protection (only admin-tier roles can access)
- **API Proxy** — Next.js rewrites proxy to backend
- **PDF Preview** — `react-pdf` for certificate template preview
- **Markdown Preview** — Live preview for reading content authoring

---

## 6. Security & Compliance

### 6.1 Security Audit (August 2026)

A full-codebase security audit was performed on 2026-08-07. **All 19 findings were fixed.** Key areas addressed:

| Severity | Finding | Status |
|---|---|---|
| **Critical** | Unauthenticated RCE via OAuth cookie deserialization (CWE-502) | ✅ Fixed |
| **Critical** | Stored XSS via sanitizer bypass → full account takeover | ✅ Fixed |
| **High** | Refresh tokens usable as access tokens, survived logout/password change | ✅ Fixed |
| **High** | No organizational tenancy for admin accounts | ✅ Fixed (inactive by default) |
| **Medium** | Assignment submissions served with no authentication | ✅ Fixed |
| **Medium** | CORS wildcard-with-credentials misconfiguration risk | ✅ Fixed |
| **Medium** | Enrollment endpoints lacked ownership checks | ✅ Fixed |
| **Medium** | OAuth cookies missing `Secure` and `SameSite` | ✅ Fixed |
| **Medium** | Sanitizer URL-scheme denylist bypassable | ✅ Fixed |
| **Medium** | Certificate numbers had low entropy (brute-forceable) | ✅ Fixed |
| **Medium** | Google OAuth linked accounts without `email_verified` check | ✅ Fixed |
| **Low** | Refresh tokens stored in plaintext in database | ✅ Fixed |
| **Low** | Login timing side-channel for email enumeration | ✅ Fixed |
| **Low** | Certificate template endpoints lacked org scoping | ✅ Fixed |
| **Low** | Upload extension filtering used incomplete denylist | ✅ Fixed |
| **Low** | Uploaded files served without `Content-Disposition` | ✅ Fixed |
| **Low** | Swagger UI had no kill switch in `cloud` profile | ✅ Fixed |
| **Low** | Admin password change didn't invalidate session | ✅ Fixed |

### 6.2 Security Features

- JWT with typed claims (`access` vs `refresh`)
- Hashed refresh tokens and reset tokens at rest
- Per-subdirectory file extension allowlists
- Authenticated access for sensitive uploads (documents, submissions)
- CORS startup-time validation
- OAuth `email_verified` enforcement
- Timing-safe login (constant-time comparison)
- `Content-Disposition: attachment` for non-media files
- No `dangerouslySetInnerHTML` with raw HTML; markdown pipeline excludes `rehype-raw`
- User-generated content (notes, discussions, submissions) rendered as plain text only

---

## 7. DevOps & Infrastructure

### 7.1 CI/CD

- **GitHub Actions** workflow (`ci.yml`) with 3 parallel jobs:
  - `backend` — Java 21 (Temurin) with Maven cache → `./mvnw -B verify`
  - `frontend` — Node.js 22 → `npm ci` + `npm run build`
  - `admin` — Node.js 22 → `npm ci` + `npm run build`
- Triggers on `push` and `pull_request` to `main`

### 7.2 Local Development

- **One-click launch:** `run-all.sh` (Linux/macOS/WSL) / `run-all.bat` (Windows)
- **Environment:** `.env` / `.env.example` for backend secrets
- **Seed Data:** 5 test accounts, demo course ("Full-Stack Foundations") with all lesson types, quiz, contest, progress data
- **Production cleanup:** Separate Flyway migration removes demo seed data in production

### 7.3 Deployment

- **Backend:** Spring Boot with `dev`, `prod`, `cloud` profiles
- **Frontend/Admin:** Cloudflare Workers via `@opennextjs/cloudflare` + Wrangler
- **Storage:** Cloudflare R2 for production; local `backend/uploads/` for development
- **Secrets:** Deployment platform secret manager (DB, JWT, OAuth, R2, SMTP, Turnstile)

### 7.4 Database

- **12+ Flyway migrations** covering:
  - Full base schema (V1)
  - Learner code generation (V2)
  - Video rules and reading content (V3)
  - Platform management (V4)
  - Comprehensive seed data (V5)
  - Seed data fixes (V6, V7)
  - Legacy role migration (V10)
  - Password reset tokens (V11)
  - OAuth exchange codes (V12)
  - Production seed cleanup (V13)
  - Organization tenancy (V14)

---

## 8. Potential Future Features

### 8.1 Learning Experience Enhancements

| Feature | Description | Priority |
|---|---|---|
| **Non-Skippable Video Enforcement** | Block seeking beyond the furthest verified watch point; require configurable watch threshold completion before unlocking quizzes | High |
| **Video Progress Autosave** | Periodic save of playback position with resume-across-devices support | High |
| **Prerequisite Gating** | Gate next lesson/module/course access until required conditions (quiz pass, video completion, assignment grade) are met | High |
| **Course Versioning** | Version courses so historical completions remain reproducible; allow editing without breaking existing enrollments | Medium |
| **Draft/Published Course States** | Admin preview of the learner experience before publishing | Medium |
| **SCORM/xAPI Compliance** | Import/export compatibility with industry LMS standards | Medium |
| **Offline Mode / PWA** | Download lessons for offline viewing via service workers or a PWA | Medium |
| **Interactive Exercises** | Code playgrounds, drag-and-drop activities, fill-in-the-blank within lessons | Low |
| **Peer Review** | Learner-to-learner assignment peer review with rubrics | Low |

### 8.2 Gamification & Engagement

| Feature | Description | Priority |
|---|---|---|
| **XP System Implementation** | Award XP for first-time learning events (video completion, quiz pass, assignment grade) with anti-farming rules | High |
| **Badges & Achievements** | Earn badges for milestones (first course, 5 quizzes passed, 7-day streak, etc.) | High |
| **Learning Streaks** | Daily/weekly activity streaks with streak-freeze option | Medium |
| **Leaderboards (Global/Team)** | Opt-in leaderboards by XP, courses completed, or custom metrics with privacy controls | Medium |
| **Learning Levels** | Starter → Builder → Achiever → Champion progression based on XP thresholds | Medium |
| **Social Sharing** | Share achievements, certificates, and badges to LinkedIn, social media, or Ties HQ | Low |

### 8.3 Assessment Improvements

| Feature | Description | Priority |
|---|---|---|
| **Question Bank / Randomization** | Randomize question selection from a pool to prevent answer sharing | High |
| **Multiple Question Types** | Fill-in-the-blank, matching, ordering, essay, code-based questions | Medium |
| **Timed Quizzes with Auto-Submit** | Configurable timer with automatic submission on expiry | Medium |
| **Partial Credit Scoring** | Award partial marks for partially correct answers | Low |
| **Anti-Cheating Measures** | Tab-switch detection, question randomization, copy-paste blocking | Low |

### 8.4 Certificate & Credential Enhancements

| Feature | Description | Priority |
|---|---|---|
| **QR Code Verification** | Embed a QR code in certificate PDF linking to the public verification page | High |
| **Certificate Expiry & Renewal** | Certificates with configurable validity periods and renewal requirements | Medium |
| **Digital Badge Standards** | Open Badges 2.0 / Verifiable Credentials compatibility | Medium |
| **Certificate Revocation** | Admin ability to revoke issued certificates with audit trail | Medium |
| **Bulk Certificate Generation** | Batch-generate certificates for cohort completions | Low |

### 8.5 Communication & Notifications

| Feature | Description | Priority |
|---|---|---|
| **Email Notifications** | Email delivery for deadlines, assignment feedback, certificate issuance | High |
| **Push Notifications** | Browser push notifications for time-sensitive alerts | Medium |
| **Notification Preferences** | Per-category notification opt-in/out (except mandatory compliance) | Medium |
| **Announcement System** | Admin-to-learner broadcast announcements | Medium |
| **In-App Messaging** | Direct messaging between learners and instructors | Low |

### 8.6 Administration & Reporting

| Feature | Description | Priority |
|---|---|---|
| **Advanced Analytics Dashboard** | Engagement funnels, completion rates by cohort, time-on-task, drop-off analysis | High |
| **Bulk Course Assignment** | Assign courses to teams, departments, roles, or audience classes | High |
| **Scheduled Assignments** | Schedule course assignments with start dates, deadlines, and automated reminders | Medium |
| **Export / Reporting** | CSV/PDF export for progress reports, completion records, and compliance evidence | Medium |
| **Course Duplication** | One-click course duplication for creating variations | Medium |
| **Instructor Role** | Separate instructor role with permissions scoped to assigned courses | Medium |
| **Compliance Dashboard** | Track mandatory training completion rates with overdue alerts | Medium |
| **Content Review Workflow** | Multi-stage content approval workflow (draft → review → published) | Low |

### 8.7 Platform & Integration

| Feature | Description | Priority |
|---|---|---|
| **Ties HQ Integration** | Deep linking, SSO, and activity sync with the broader Ties ecosystem | High |
| **Multi-Tenant Organization Activation** | Activate the existing organization scoping infrastructure for real multi-tenant deployments | High |
| **Webhook / Event System** | Emit events on enrollment, completion, and certificate issuance for external integrations | Medium |
| **API Rate Limiting** | Per-user/per-IP rate limiting on public endpoints (login, registration, verification) | Medium |
| **Internationalization (i18n)** | Multi-language support for UI and course content | Medium |
| **Accessibility (WCAG 2.2 AA)** | Full accessibility audit and remediation to meet the stated target | Medium |
| **Native Mobile App** | React Native or Flutter mobile application | Low |
| **Public API / SDK** | Documented public API for third-party integrations | Low |
| **Payment / Marketplace** | Course purchases, subscriptions, and revenue sharing for external courses | Low |

### 8.8 Technical Debt & Improvements

| Feature | Description | Priority |
|---|---|---|
| **Admin CSS Audit** | Full audit of `admin/app/globals.css` — remove duplication from learner frontend | High |
| **R2 Migration Tool** | Automated migration of seed/historical files from `backend/uploads/` to Cloudflare R2 | Medium |
| **Backend Unit Test Coverage** | Expand test suite beyond current state | Medium |
| **Frontend Testing** | Add Playwright/Cypress E2E tests and React Testing Library unit tests | Medium |
| **API Versioning Strategy** | Formalize v1 → v2 migration path for breaking changes | Low |
| **Database Connection Pooling** | Production-grade connection pool tuning (HikariCP) | Low |
| **Logging & Observability** | Structured logging, distributed tracing, health dashboards | Medium |
| **Contest Scoring Table** | Dedicated scoring model for contests with independent timer/scoring rules | Low |

### 8.9 AI & Advanced Features

| Feature | Description | Priority |
|---|---|---|
| **AI-Assisted Grading** | AI-suggested grades for assignment submissions with mandatory human review | Low |
| **Smart Recommendations** | ML-based course recommendations based on learning history and goals | Low |
| **Auto-Generated Transcripts** | Whisper/speech-to-text for automatic video transcript generation | Medium |
| **Chatbot / Learning Assistant** | In-app AI tutor for learner Q&A on course material | Low |
| **Content Summarization** | AI-generated lesson summaries and study guides | Low |

---

> [!NOTE]
> Priorities in section 8 are suggestions based on the product scope document, user journey specs, and gaps between the documented vision and current implementation. They should be reviewed and reprioritized based on business needs and user feedback.

> [!TIP]
> Features marked as **High** priority in section 8 represent gaps between what the product scope defines and what is currently implemented — these are the most impactful candidates for the next development cycle.
