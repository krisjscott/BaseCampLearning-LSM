# BaseCamp Learning

BaseCamp is a learning and certification platform with three pieces:

- **`backend/`** - Spring Boot 3 / Java 21 REST API (Postgres via Flyway migrations, JWT auth).
- **`frontend/`** - Next.js app for learners, port **3100**.
- **`admin/`** - Next.js "Ops Console" for trainers/admins, port **3101**.

This document is written for the next engineer picking up the project: how the backend is organized, how to run everything locally in one step, every seeded test account, and what's intentionally out of scope.

---

## 1. Architecture

The backend is a single Spring Boot monolith, but its packages are organized 1:1 with the service boundaries from the platform's reference architecture (HLD). Nothing here is a literal microservice - there's one JVM process and one Postgres database - but the package split maps directly onto that design, so splitting any of these out later is a lift-and-shift, not a rewrite.

| Backend package | Reference service | Responsibility |
|---|---|---|
| `auth`, `security` | Identity / Auth Service | Registration, login, JWT issue+refresh, password reset, email/OTP verification |
| `admin` | IAM + Audit + Analytics Service | Admin-only CRUD surface (`/api/v1/admin/**`), role-gated by `SecurityConfig`, every mutation writes an `AuditLog` row |
| `course` | Course Management Service | Categories, courses, modules, lessons, reading content |
| `assessment` | Quiz Service | Assessments, questions, options, results, answers |
| `contest` | Quiz Service (leaderboard) | Time-boxed leaderboard wrapping an `assessment` - see [Contests](#contests-design) below |
| `assignment` | Quiz Service (assignment grading) | Learner submissions + instructor grading for `ASSIGNMENT`-type lessons |
| `notes`, `bookmark`, `discussion` | Engagement Service | Per-lesson notes/bookmarks, course discussion threads |
| `certificate` | Certificate Service | Certificate issuance and lookup |
| `notification` | Notification Service | In-app notifications |
| `enrollment`, `progress` | Enrollment/Progress Service | Enrollments, course/lesson progress, learning paths |
| `organization` | Org/Directory Service | Organizations/departments/teams/employees - **retained in the backend but no longer surfaced in the admin UI** (see [Known limitations](#7-known-limitations--not-built)) |
| `analytics`, `dashboard` | Analytics Service | Aggregated stats for admin and learner dashboards |
| `common.storage` | Object Storage (S3 in the target design) | `FileStorageService` writes uploads to local disk under `backend/uploads/` and serves them back via `/uploads/**`. There is no real S3 bucket wired up - see [Known limitations](#7-known-limitations--not-built) |
| `search` | Search Service | Course/content search |

**Security model**: five roles (`PUBLIC_USER`, `EMPLOYEE`, `TRAINER`, `HR_ADMIN`, `ORGANIZATION_ADMIN`, `SUPER_ADMIN`). `/api/v1/admin/**` requires `TRAINER`/`HR_ADMIN`/`ORGANIZATION_ADMIN`/`SUPER_ADMIN` at the `SecurityConfig` path-matcher level (defense in depth on top of any per-endpoint `@PreAuthorize`). The **admin frontend app** additionally gates on `HR_ADMIN`/`ORGANIZATION_ADMIN`/`SUPER_ADMIN` only - `TRAINER` accounts can call the admin API directly but don't currently get a UI for it.

**File uploads**: lesson videos, captions, and assignment submission files all go through `FileStorageService.store()`, which sanitizes the extension (rejects path-traversal characters) and blocks executable/script extensions (`.html`, `.svg`, `.js`, `.exe`, etc.) so an upload endpoint can't be used to plant content that executes when served back from `/uploads/**`. Video uploads are additionally validated server-side against the admin-configurable `VideoRules` (allowed formats, max size). Caption uploads (`.vtt`/`.srt`) are normalized to WebVTT by `SubtitleConverter` - `.srt` timestamps are rewritten (`,` → `.`) and a `WEBVTT` header is prepended, since `<track>` only accepts WebVTT.

**Markdown/LaTeX**: lesson reading content and admin-authored articles render through `react-markdown` + `remark-math` + `rehype-katex` with **no** `rehype-raw` plugin, so raw HTML can never execute from markdown content. User-generated content (notes, discussion posts, assignment submissions) is always rendered as plain text, never through the markdown pipeline - it's the only thing keeping arbitrary user text from being a stored-XSS vector.

<a name="contests-design"></a>**Contests design**: a `Contest` is just a title/description/time-window wrapped around an existing `Assessment`. There is no separate scoring table - `ContestService.getLeaderboard()` derives the leaderboard live from `AssessmentResult` rows for that assessment, filtered to `submittedAt` within `[startAt, endAt]`, best score per user (tie-break: earliest submission). This was a deliberate minimal design since Contests had no prior specification - it reuses tested quiz-scoring data instead of inventing a second scoring system.

---

## 2. Repo layout

```
backend/    Spring Boot API (Java 21, Maven)
frontend/   Learner-facing Next.js app -> localhost:3100
admin/      Admin "Ops Console" Next.js app -> localhost:3101
run-all.sh  One-click launcher (Linux/macOS/WSL/Git Bash)
run-all.bat One-click launcher (Windows, native cmd)
```

Uploaded media referenced by the seed data lives in `backend/uploads/` and is committed to the repo (a real deployment would point `app.storage.root` at a persistent volume or swap `FileStorageService` for a real object-storage client instead).

---

## 3. Running it

### One-click (recommended)

From the repo root:

```bash
./run-all.sh
```

```bat
run-all.bat
```

Both scripts install `node_modules` for `frontend`/`admin` if missing, then start all three services:

- Backend API → http://localhost:8081
- Learner app → http://localhost:3100
- Admin console → http://localhost:3101

`run-all.sh` backgrounds all three and stops them together on Ctrl+C. `run-all.bat` opens three separate console windows - close a window to stop that service.

### Manual

```bash
# Backend (needs backend/.env - see below)
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run   # mvnw.cmd on Windows

# Learner frontend
cd frontend && npm install && npm run dev:local     # -> :3100

# Admin console
cd admin && npm install && npm run dev:local        # -> :3101
```

### Environment

Copy `backend/.env.example` to `backend/.env` and fill in a real Postgres `DB_URL`/`DB_USERNAME`/`DB_PASSWORD` (Flyway runs automatically on startup). Everything else in that file (Turnstile, Google OAuth, SMTP, Redis, RabbitMQ) is optional for local dev - **Google OAuth in particular can be left blank**: the client autoconfiguration is explicitly excluded in `BaseCampLearningApplication` because nothing wires it into Spring Security's login flow, and leaving it enabled with an empty `GOOGLE_CLIENT_ID` used to hard-crash startup.

`frontend/` and `admin/` each proxy `/api/v1/**` and `/uploads/**` to the backend via Next.js rewrites (see `next.config.ts` in each app) - `NEXT_PUBLIC_API_BASE_URL` only needs to be set if the backend isn't on `localhost:8081`.

---

## 4. Database migrations

Flyway migrations live in `backend/src/main/resources/db/migration/`, applied in order automatically on startup:

| Migration | What it does |
|---|---|
| `V1__init_schema.sql` | Full base schema (accounts, users, courses, modules, lessons, assessments, enrollments, certificates, notifications, audit logs, etc.) |
| `V2__add_user_learner_code.sql` | Adds `users.learner_code` (auto-generated `BC-CR-###`) |
| `V3__add_admin_video_rules_and_reading_content.sql` | `video_rules` singleton + `reading_contents` table |
| `V4__admin_platform_management.sql` | `accounts.active` flag, unique constraint on `reading_contents.lesson_id` |
| `V5__lms_completion.sql` | `lessons.captions_url`; new `notes`, `bookmarks`, `discussion_posts`, `assignment_submissions`, `contests` tables; **seed data** (accounts, the "Full-Stack Foundations" demo course, a quiz, a contest, notes/bookmarks/discussion) |
| `V6__fix_seed_account_user_links.sql` | Patches a bug in V5's seed: `accounts.user_id` (the forward pointer `AuthContext.currentUserId()` reads) was never set for the 6 seeded accounts, which silently broke every self-scoped endpoint (enrollments, notes, bookmarks...) for those users |
| `V7__seed_course_progress.sql` | Adds `course_progress`/`lesson_progress` rows for the seeded learner, so "Continue learning" on the dashboard isn't empty on first login |

**Never edit an already-applied migration** - Flyway checksums it. If you need to fix a mistake in seed data or schema, add a new `Vn__...sql` file, as `V6`/`V7` do above.

---

## 5. Test accounts

All seeded via `V5`/`V6`, password **`Passw0rd!123`** for every account, hashed with pgcrypto's `crypt(password, gen_salt('bf', 10))` (bcrypt-compatible with Spring Security's `BCryptPasswordEncoder`).

| Email | Role | Where to log in |
|---|---|---|
| `super.admin@basecamp.dev` | SUPER_ADMIN | admin (:3101) |
| `org.admin@basecamp.dev` | ORGANIZATION_ADMIN | admin (:3101) |
| `hr.admin@basecamp.dev` | HR_ADMIN | admin (:3101) |
| `trainer@basecamp.dev` | TRAINER | backend API only (admin UI restricts to HR/Org/Super admin - see [Architecture](#1-architecture)) |
| `learner.one@basecamp.dev` | PUBLIC_USER | frontend (:3100) - enrolled in the seed course with progress, notes, a bookmark, a discussion post, and an ungraded assignment submission |
| `learner.two@basecamp.dev` | PUBLIC_USER | frontend (:3100) - enrolled, no activity yet (clean-state test account) |

The seed course, **"Full-Stack Foundations"**, has 2 modules and 5 lessons covering every content type: a `VIDEO` lesson with a real seeded video file, WebVTT captions, and a derived transcript; an `ARTICLE` lesson with Markdown + LaTeX; a `DOCUMENT` lesson; an `ASSIGNMENT` lesson (with one ungraded submission from `learner.one`, ready to grade from the admin's course editor); and a `QUIZ` lesson backed by a real 2-question `Assessment`, wrapped by a seeded "Quiz Sprint Challenge" contest with a live leaderboard entry.

Several other accounts pre-date this seed (from earlier manual QA sessions against this same dev database) - `qa-verify-notes-ui@example.com`, `test@...`, etc. They're harmless leftovers, not part of the documented seed set above.

---

## 6. API surface (by domain)

All endpoints are under `/api/v1/`. Learner-facing endpoints require a valid JWT (`Authorization: Bearer ...`) unless noted; admin endpoints additionally require an admin-tier role.

- **`auth`** - `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/verify-otp` (all public)
- **`courses`** - `GET /courses`, `/courses/{id}`, `/courses/{id}/modules`, `/courses/lessons/{id}` (GET is public; POST/PUT/DELETE require TRAINER+)
- **`assessments`** - quiz CRUD, `POST /assessments/submit`, `GET /assessments/results`
- **`contests`** - `GET /contests/active?courseId=`, `GET /contests/{id}/leaderboard` (learner-facing, read-only)
- **`notes`** - full CRUD under `/notes`, scoped to the authenticated user
- **`bookmarks`** - `GET/POST /bookmarks`, `DELETE /bookmarks/lesson/{lessonId}`
- **`discussions`** - `GET /discussions?courseId=`, `POST /discussions` (with optional `parentId` for one level of reply nesting), `DELETE /discussions/{id}` (own post, or any post if admin)
- **`assignments`** - `POST /assignments/{lessonId}/submit` (multipart, text and/or file), `GET /assignments/{lessonId}/my-submission`
- **`enrollments`**, **`certificates`**, **`notifications`**, **`dashboard`** - learner-facing, self-scoped
- **`admin/**`** - the full admin surface: account management, course/module/lesson/quiz authoring, video rules, reading content, lesson video/caption uploads, assignment grading, contest CRUD, the learner directory, audit log. See `AdminController` for the complete list.

---

## 7. Known limitations / not built

- **No real object storage.** `FileStorageService` writes to local disk (`backend/uploads/`, configurable via `app.storage.root`) instead of S3/GCS. Fine for a single-instance deployment; would need to change for anything horizontally scaled.
- **No literal microservice split.** One Spring Boot process, one database. The package structure maps onto the reference architecture (see [Architecture](#1-architecture)) so a future split is straightforward, but nothing here is independently deployable today.
- **Contests have no dedicated scoring table** by design - see [Contests design](#contests-design). If contests ever need their own timer/scoring rules independent of the underlying quiz, that'll need a real design pass.
- **The admin app's bulk CSS cleanup was scoped down.** `admin/app/globals.css` looks like it's ~90% duplicated from the learner frontend's stylesheet, but it is **not** dead code - the admin app's own auth/onboarding pages reuse those unprefixed classes for a consistent look. A full audit (there are 5 more `:root` blocks scattered through the file besides the one at the top) was out of scope for this pass; a targeted overlap bug in the mobile course-list layout was found and fixed instead (see the CSS trim-and-revert in the `admin/app/courses` styles history if you want the story).
- **`organization`/`department`/`team`/`employee`** backend domain is untouched and still fully functional at the API level - it's just no longer exposed in the admin UI (the Learners page and dashboard now use org-independent endpoints). Nothing else in the system depends on it being removed, so it was left in place rather than deleted.
- **The `TRAINER` role has no admin UI.** The backend authorizes trainers for the full `/api/v1/admin/**` surface, but `admin/app/components/AdminGuard.tsx` only allows `HR_ADMIN`/`ORGANIZATION_ADMIN`/`SUPER_ADMIN` into the console itself. A trainer today would need direct API access or a role upgrade.
- **Google OAuth is unimplemented.** `AuthProvider.GOOGLE` exists as an enum value and the config keys exist in `.env.example`, but there's no controller wiring it up, and the Spring OAuth2 client autoconfiguration is explicitly excluded (see [Environment](#environment)) since it isn't used.
