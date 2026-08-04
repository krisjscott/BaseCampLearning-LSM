# Backend Change Log And Issue Notes

This document records the backend-related changes made while merging the backend into the BaseCamp app and the follow-up fixes made after that integration. It focuses on what changed, what issue caused the change, and how it was fixed.

## Scope

- Repository: `nirjharrrr/BaseCamp`
- Working branch: `ahan`
- Backend project: `backend/`
- Frontend integration points: `frontend/app/lib/backendApi.ts`, auth/onboarding/dashboard pages, and route protection
- Production database target: PostgreSQL-compatible cloud database through environment variables

## Merge And Backend Integration

### Backend Merge

The backend from the upstream branch was merged into `ahan` and the app was reorganized so the final project has a clear `backend/` Spring Boot API and `frontend/` Next.js app.

Issue:
- The frontend clone needed to be connected to a real backend instead of running only as a visual/demo experience.
- Backend and frontend configuration needed to work together from one repo.

Fix:
- Merged the backend branch into `ahan`.
- Added backend environment examples and production startup docs.
- Added frontend backend client wiring through `NEXT_PUBLIC_API_BASE_URL`.
- Added backend CORS configuration so the deployed frontend can call the API origin.
- Added route protection through frontend auth middleware/guards.

Related commits:
- `9119b5a` - merge backend branch into `ahan`
- `2bc23a5` - add local env file support
- `36f70ad` - backend URL support for frontend access
- `d01a347` - base run files for backend/frontend

## Production Database Configuration

### Removed Local Demo Database Flow

The initial local H2/demo setup was removed when the requirement changed from demo-local to production-ready cloud database.

Issue:
- Local H2 files and seeded demo data were not production-safe.
- The app could appear functional with fake data while not actually proving production DB connectivity.

Fix:
- Removed the local H2 application profile and demo seed SQL.
- Removed the committed local DB file.
- Required production DB connection values through environment variables.
- Kept `.env.example` placeholders only, with no real credentials committed.

Related commits:
- `d69d2c6` - remove local H2 profile
- `6338455` - prepare production database configuration

### Production Profile

Issue:
- Production startup needed explicit database, Redis, RabbitMQ, JWT, Turnstile, and CORS settings.

Fix:
- `application-prod.yml` now reads `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, Redis, RabbitMQ, CORS, and JWT values from environment variables.
- `start-cloud.sh` checks required cloud variables before starting.
- Documentation now tells deployment operators to set `SPRING_PROFILES_ACTIVE=prod`.

## Authentication And Registration

### Fetch Failures And API Base URL

Issue:
- Registration/login could show "failed to fetch" when the frontend did not have the correct backend origin or the backend did not allow that origin.

Fix:
- Updated `backendApi.ts` so browser calls use `NEXT_PUBLIC_API_BASE_URL`.
- Updated frontend config so backend API env values are exposed at build/runtime.
- Updated backend CORS to read `CORS_ALLOWED_ORIGINS`.

Related commits:
- `77e56d3` - fix production auth API connection
- `a094125` - fix production auth fetch configuration

### Turnstile UI And Auth Layout

Issue:
- Adding Cloudflare Turnstile caused lower auth text to be hidden or squeezed.

Fix:
- Adjusted the auth screen layout so the Turnstile widget fits without hiding organization/help text or legal copy.
- Kept Turnstile configurable through `TURNSTILE_ENABLED` and frontend site key env values.

Related commit:
- `e0e31c8` - fix auth layout with Turnstile widget

### Removed Prefilled Demo User

Issue:
- Demo/pre-filled users made the app look connected while bypassing real registration/login behavior.

Fix:
- Removed demo user assumptions and demo experience service wiring.
- New registration now uses backend auth and onboarding flow.

Related commit:
- `3d3ead3` - remove demo data seeding and wire production data

## Backend Data Wiring

### No Static Data While Loading

Issue:
- Some pages displayed static placeholder/demo content before real backend data loaded.

Fix:
- Added skeleton loading states.
- Changed frontend screens to wait for backend responses rather than showing static data as if it were real.

Related commit:
- `2386083` - show skeletons while backend data loads

### Learner Profile Code

Issue:
- Profile/sidebar needed a stable backend-generated learner code such as `BC-CR-021`.

Fix:
- Added `learner_code` storage to the `users` table via Flyway migration.
- Exposed learner code in user responses.
- Updated frontend profile/sidebar surfaces to display stored learner codes from the API.

Related commit:
- `794b67b` - add stored learner profile codes

### Achievements And Progress

Issue:
- Achievements and progress pages still had static metrics and progress cards.

Fix:
- Connected achievements/progress UI to backend learner data.
- Added shared frontend level-progress helpers.
- Made progress bars and level cards derive values from API data.

Related commits:
- `2199f0b` - connect achievements and progress to backend data
- `b70c6b1` - make learning level card dynamic
- `ca7313e` - fix dynamic level progress meter

## Navigation And Account Controls

Issue:
- Sidebar/menu links were not fully wired.
- User needed profile preferences and sign-out connected from account surfaces.

Fix:
- Linked sidebar navigation items to their pages.
- Added sign-out controls on desktop and mobile account surfaces.
- Updated logout client behavior to call the backend endpoint with the active bearer token.

Related commits:
- `f9d153a` - link sidebar navigation items
- `1f1fa7f` - add sign out controls
- `bafff28` - hardened logout endpoint behavior

## Security Audit And Hardening

The final security pass reviewed backend auth boundaries, public endpoints, user-scoped data access, JWT behavior, validation, production defaults, dependency age, and accidental secret exposure.

### Over-broad Public Endpoints

Issue:
- Swagger/API docs and broad actuator surfaces were too easy to expose.
- Auth path matching was too broad.

Fix:
- Replaced broad auth allowlisting with explicit auth endpoints only.
- Restricted Swagger/OpenAPI docs to admin roles.
- Restricted actuator endpoints to `health`/`info` publicly and admin-only for the rest.
- Disabled API docs by default in `prod`.

Files:
- `backend/src/main/java/com/tiesverse/backend/config/SecurityConfig.java`
- `backend/src/main/resources/application-prod.yml`

### IDOR / User Data Ownership Risks

Issue:
- Several endpoints accepted `userId`, notification IDs, certificate IDs, or assessment result IDs without consistently proving the caller owned that resource.
- A user could potentially read or mutate another user's progress, assessment history, notifications, certificates, enrollments, dashboard data, or activity data.

Fix:
- Added `AuthContext` as a shared ownership helper.
- Added `requireSelfOrAdmin` checks for user-scoped routes.
- Added resource owner checks for certificate, notification, and assessment result access.
- Kept admin access limited to admin roles.

Files:
- `backend/src/main/java/com/tiesverse/backend/security/AuthContext.java`
- `backend/src/main/java/com/tiesverse/backend/progress/controller/ProgressController.java`
- `backend/src/main/java/com/tiesverse/backend/assessment/controller/AssessmentController.java`
- `backend/src/main/java/com/tiesverse/backend/assessment/service/AssessmentServiceImpl.java`
- `backend/src/main/java/com/tiesverse/backend/notification/service/NotificationServiceImpl.java`
- `backend/src/main/java/com/tiesverse/backend/certificate/service/CertificateServiceImpl.java`
- `backend/src/main/java/com/tiesverse/backend/enrollment/controller/EnrollmentController.java`
- `backend/src/main/java/com/tiesverse/backend/dashboard/controller/DashboardController.java`
- `backend/src/main/java/com/tiesverse/backend/user/controller/UserController.java`

### Logout Could Target Any Email

Issue:
- Logout accepted an email request parameter. If public, that could let someone invalidate another user's refresh token if they knew the email.

Fix:
- Backend logout now uses the authenticated principal instead of an email parameter.
- Frontend logout now sends the current bearer token before clearing local session state.

Files:
- `backend/src/main/java/com/tiesverse/backend/auth/controller/AuthController.java`
- `frontend/app/lib/backendApi.ts`

### Refresh Token Validation

Issue:
- Refresh-token lookup verified that the token existed in the database, but did not fully validate JWT signature, subject, and expiration before issuing new tokens.

Fix:
- Added JWT validation helper.
- Refresh now rejects invalid/expired/mismatched refresh tokens and clears stale stored refresh tokens.

Files:
- `backend/src/main/java/com/tiesverse/backend/security/jwt/JwtProvider.java`
- `backend/src/main/java/com/tiesverse/backend/auth/service/AuthServiceImpl.java`

### Forgot Password Account Enumeration

Issue:
- Forgot-password could reveal whether an email exists.

Fix:
- Unknown emails now return the same outward flow instead of throwing an account-not-found error.

File:
- `backend/src/main/java/com/tiesverse/backend/auth/service/AuthServiceImpl.java`

### Weak Request Validation

Issue:
- Some auth and learning request DTOs accepted invalid or oversized inputs.
- Progress time could be negative or too large.
- Assessment submissions could be empty.

Fix:
- Added stricter validation annotations for email, password, names, refresh tokens, progress minutes, and assessment answers.

Files:
- `backend/src/main/java/com/tiesverse/backend/auth/dto/request/RegisterRequest.java`
- `backend/src/main/java/com/tiesverse/backend/auth/dto/request/LoginRequest.java`
- `backend/src/main/java/com/tiesverse/backend/auth/dto/request/RefreshTokenRequest.java`
- `backend/src/main/java/com/tiesverse/backend/progress/dto/request/UpdateProgressRequest.java`
- `backend/src/main/java/com/tiesverse/backend/assessment/dto/request/SubmitAssessmentRequest.java`

### Production Defaults

Issue:
- `prod` could inherit a fallback JWT secret from the base config if deployment env values were missing.
- Localhost CORS was allowed by default in common config.

Fix:
- `application-prod.yml` now requires `JWT_SECRET`.
- Production disables docs by default.
- CORS only includes localhost origin patterns for `local` or `dev` profiles; production must use explicit `CORS_ALLOWED_ORIGINS`.

Files:
- `backend/src/main/resources/application-prod.yml`
- `backend/src/main/java/com/tiesverse/backend/config/CorsConfig.java`

### Rate Limiter Memory Growth

Issue:
- In-memory rate limit tracking did not prune expired client windows.

Fix:
- Added expired-window cleanup before rate-limit checks.

File:
- `backend/src/main/java/com/tiesverse/backend/security/filter/RateLimitFilter.java`

### Dependency Patch Level

Issue:
- Backend was using Spring Boot `3.3.2`.
- Security review found it should be moved to the latest compatible `3.3.x` patch line.

Fix:
- Upgraded Spring Boot parent to `3.3.13`.
- Kept the app on the same major/minor compatibility family.

File:
- `backend/pom.xml`

### Test Isolation

Issue:
- `mvn test` defaulted to `prod` and connected to the cloud database during the security pass.

Fix:
- Added a `test` profile with in-memory H2.
- Marked `BaseCampLearningApplicationTests` with `@ActiveProfiles("test")`.
- Added H2 as a test-scoped dependency.

Files:
- `backend/pom.xml`
- `backend/src/test/resources/application-test.yml`
- `backend/src/test/java/com/tiesverse/backend/BaseCampLearningApplicationTests.java`

## Verification Performed

Latest verified commands:

```powershell
cd F:\basecamp\backend\backend
$env:JAVA_HOME='C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot'
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd test
.\mvnw.cmd -q -DskipTests package
```

```powershell
cd F:\basecamp\backend\frontend
npm.cmd run build
```

Additional checks:
- `git diff --check` passed.
- Secret grep found only placeholders/examples in tracked files.
- Remaining `userId` route parameters were reviewed and are guarded by ownership checks.
- Full OWASP Dependency Check was attempted, but the process hung silently in the local environment and was stopped. A full dependency CVE scan should be run in CI with a configured NVD API key.

## Remaining Production Notes

- Set `JWT_SECRET`, `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, Redis, RabbitMQ, Turnstile, and CORS variables in deployment.
- Keep `TURNSTILE_ENABLED=true` only when valid Cloudflare keys are configured.
- Do not commit `.env`, `.env.local`, local database files, build output, logs, or generated artifacts.
- Organization/admin endpoints still depend on service-level organization membership rules for strict tenant isolation. The latest hardening blocks obvious self-vs-other-user access, but deeper tenant scoping should be reviewed when organization admin workflows are finalized.
