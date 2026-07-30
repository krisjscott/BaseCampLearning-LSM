# Base Camp — API test frontend

Vanilla HTML/CSS/JS harness for exercising the Spring Boot backend (`/api/v1/*`). Wireframe only: text, buttons, empty image placeholders, and a live response panel.

## Run

Backend CORS allows ports `3000`, `3002`, and `5500` (localhost / 127.0.0.1).

**Do not use port 3000 if another app already owns it.**

```bash
# from repo root, with backend on :8081
cd frontend
python3 -m http.server 3002
```

Open http://localhost:3002 (API default: `http://localhost:8081`)

Do not open `index.html` via `file://` — the browser will block API calls (NetworkError).

## What it covers

| Area | Screens |
|---|---|
| Auth | Register, login, refresh, logout, forgot password |
| Learner | Home, catalog/search, course, lesson, progress, quiz, certificates, notifications, profile |
| Admin | Course builder, assessment builder, assign/paths, organization, monitor/analytics |

Every action calls the real API and shows status + minimal rendered fields + full JSON in the right panel. JWT is stored in `localStorage` after login/register; subsequent calls send `Authorization: Bearer …`.

## Context IDs

The top bar holds reusable UUIDs (`userId`, `courseId`, `lessonId`, `orgId`, `assessmentId`) that forms default to after create/load actions.
