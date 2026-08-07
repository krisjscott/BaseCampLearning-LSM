# BaseCamp Learning

BaseCamp is a learning and certification platform with three pieces:

- **`backend/`** - Spring Boot 3 / Java 21 REST API (Postgres via Flyway migrations, JWT auth).
- **`frontend/`** - Next.js app for learners, port **3100**.
- **`admin/`** - Next.js "Ops Console" for platform administrators, port **3101**.

This document is written for the next engineer picking up the project: how the backend is organized, how to run everything locally in one step, every seeded test account, and what's intentionally out of scope.

---

## 1. Architecture

The backend is a single Spring Boot monolith organized by domain. It runs as one JVM process against one Postgres database.

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
| `common.storage` | Object Storage | `FileStorageService` uploads to Cloudflare R2 through its S3-compatible API when R2 credentials are configured. Files remain accessible through `/uploads/**`; local `backend/uploads/` files are used as a development and migration fallback. |
| `search` | Search Service | Course/content search |

**Security model**: four roles (`PUBLIC_USER`, `HR_ADMIN`, `ORGANIZATION_ADMIN`, `SUPER_ADMIN`). `/api/v1/admin/**` and course-authoring mutations require `HR_ADMIN`/`ORGANIZATION_ADMIN`/`SUPER_ADMIN` at the `SecurityConfig` path-matcher level, with per-endpoint authorization providing defense in depth.

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

Uploaded media referenced by the seed data lives in `backend/uploads/` and is committed to the repo. When R2 is configured, new uploads go to R2 while those local seed files remain readable until migrated.

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

Copy `backend/.env.example` to `backend/.env` for local development. Production credentials and integration secrets are supplied only through the deployment platform's secret manager; they are not documented here.

`frontend/` and `admin/` each proxy `/api/v1/**` and `/uploads/**` to the backend via Next.js rewrites (see `next.config.ts` in each app). If `NEXT_PUBLIC_API_BASE_URL` is set, it must point to the running backend - for the local stack use `http://localhost:8081`, never the `https://api.your-basecamp-domain.com` example placeholder. Restart the frontend after changing a `NEXT_PUBLIC_*` value.

### Cloudflare R2 uploads

R2 credentials are backend-only deployment secrets. When configured, new uploads use R2 and the backend proxies `/uploads/**` reads, so the frontend never receives R2 credentials. Existing local files are used only if the object is not yet present in R2.

### Google sign-up

Google sign-up is available through Spring Security OAuth2. Configure the OAuth client credentials through local `.env` files or the deployment secret manager; do not commit them or document their values.

In Google Cloud Console, register `http://localhost:8081/login/oauth2/code/google` as an authorized redirect URI (use the deployed backend URL in production). A successful Google authorization creates a new `PUBLIC_USER` account and user settings, or links Google to an existing account with the same email. New users go to onboarding; returning users go to learning.

Google provides the user's display name and profile picture through the standard `openid profile email` scope, so those are saved automatically. Google does not normally provide a phone number through that scope; new users are prompted for an optional phone number during onboarding, and it is saved to `users.phone`. If an identity provider supplies a `phone_number` claim, BaseCamp stores it when the account is created or when the existing profile has no phone number.

The OAuth authorization request needs an HTTP session, so the security configuration uses `SessionCreationPolicy.IF_REQUIRED` rather than a fully stateless policy. `GoogleOAuthService` injects `PasswordEncoder` with `@Lazy`: the OAuth success handler is created by `SecurityConfig`, which also declares the password-encoder bean, and lazy injection breaks that otherwise circular dependency.

### Production deployment checklist

Before deployment, run the backend with the `prod` profile, configure `CORS_ALLOWED_ORIGINS` with the exact HTTPS origins of the learner and admin applications, and provide database, JWT, OAuth, R2, SMTP, Turnstile, and messaging values through the deployment secret manager. Register the deployed backend callback URL with Google OAuth, provide the one-time initial-admin bootstrap values, remove the initial password secret after the first successful start, and confirm that Flyway applies the production-only demo-data cleanup migration. Build both Next.js applications with their production environment values before publishing them.

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
| `V10__remove_legacy_roles.sql` | Converts legacy `TRAINER` and `EMPLOYEE` account rows to the current role model before the application loads them |
| `V11__password_reset_tokens.sql` | Adds hashed, expiring, one-time password reset tokens |
| `V12__oauth_exchange_codes.sql` | Adds hashed, expiring, one-time Google OAuth exchange codes |

Production additionally loads `db/migration-prod/V13__remove_demo_seed_data.sql`, which removes the local/demo accounts and sample course data created by the shared V5/V7 migrations. Local development continues to receive the demo dataset. Create the first production super-admin with the one-time `INITIAL_ADMIN_*` deployment secrets, then remove the password secret after the first successful start.

**Never edit an already-applied migration** - Flyway checksums it. If you need to fix a mistake in seed data or schema, add a new `Vn__...sql` file, as `V6`/`V7` do above.

---

## 5. Test accounts

These accounts are for local development only. Production loads the production-only cleanup migration and does not retain them. Do not use these credentials in a deployed environment.

| Email | Role | Where to log in |
|---|---|---|
| `super.admin@basecamp.dev` | SUPER_ADMIN | admin (:3101), local only |
| `org.admin@basecamp.dev` | ORGANIZATION_ADMIN | admin (:3101), local only |
| `hr.admin@basecamp.dev` | HR_ADMIN | admin (:3101), local only |
| `learner.one@basecamp.dev` | PUBLIC_USER | frontend (:3100), local only |
| `learner.two@basecamp.dev` | PUBLIC_USER | frontend (:3100), local only |

For local development, the seeded accounts use the password configured in the local seed migration. Production administrators must be created through the one-time `INITIAL_ADMIN_*` bootstrap secrets described above.

The seed course, **"Full-Stack Foundations"**, has 2 modules and 5 lessons covering every content type: a `VIDEO` lesson with a real seeded video file, WebVTT captions, and a derived transcript; an `ARTICLE` lesson with Markdown + LaTeX; a `DOCUMENT` lesson; an `ASSIGNMENT` lesson (with one ungraded submission from `learner.one`, ready to grade from the admin's course editor); and a `QUIZ` lesson backed by a real 2-question `Assessment`, wrapped by a seeded "Quiz Sprint Challenge" contest with a live leaderboard entry.

Several other accounts pre-date this seed (from earlier manual QA sessions against this same dev database) - `qa-verify-notes-ui@example.com`, `test@...`, etc. They're harmless leftovers, not part of the documented seed set above.

---

## 6. API surface (by domain)

All endpoints are under `/api/v1/`. Learner-facing endpoints require a valid JWT (`Authorization: Bearer ...`) unless noted; admin endpoints additionally require an admin-tier role.

- **`auth`** - `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/verify-otp` (all public)
- **Password security** - authenticated `POST /auth/change-password` for all account roles, plus one-time expiring email reset links through `/auth/forgot-password` and `/auth/reset-password`
- **`courses`** - `GET /courses`, `/courses/{id}`, `/courses/{id}/modules`, `/courses/lessons/{id}` (GET is public; POST/PUT/DELETE require an administrator role)
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

- **R2 object migration is manual.** New uploads use R2 once configured, but existing seed and historical files in `backend/uploads/` are not copied automatically. Upload or migrate them to their matching R2 prefixes before removing local storage from a deployment.
- **Contests have no dedicated scoring table** by design - see [Contests design](#contests-design). If contests ever need their own timer/scoring rules independent of the underlying quiz, that'll need a real design pass.
- **The admin app's bulk CSS cleanup was scoped down.** `admin/app/globals.css` looks like it's ~90% duplicated from the learner frontend's stylesheet, but it is **not** dead code - the admin app's own auth/onboarding pages reuse those unprefixed classes for a consistent look. A full audit (there are 5 more `:root` blocks scattered through the file besides the one at the top) was out of scope for this pass; a targeted overlap bug in the mobile course-list layout was found and fixed instead (see the CSS trim-and-revert in the `admin/app/courses` styles history if you want the story).
- **Organization directory records** remain available in the backend API but are no longer exposed in the admin UI. The Learners page and dashboard use org-independent endpoints; these records are separate from the four authentication roles.
- **Google OAuth uses a short-lived, one-time exchange code.** The callback URL contains only an opaque code; the frontend exchanges it once with the backend for JWTs, and the code is then invalidated.
- **Fonts are self-contained at build time.** Both Next.js apps use a system font stack and do not require Google Fonts network access during production builds.
