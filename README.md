# BaseCamp Learning

BaseCamp is a production-ready learning and certification platform with a Next.js frontend and a Spring Boot backend. The frontend is wired to the backend through `NEXT_PUBLIC_API_BASE_URL`, and the backend expects a production database and service credentials through environment variables.

## Project Layout

- `frontend/app/` - Next.js app routes, UI, route protection, and backend API client.
- `frontend/public/` - BaseCamp logos, favicon assets, and static media.
- `backend/` - Spring Boot API, authentication, course, onboarding, dashboard, quiz, certificate, and notification services.

## Requirements

- Node.js 20 or newer.
- npm.
- JDK 21.
- PostgreSQL-compatible production database.
- Redis and RabbitMQ for the `prod` profile.

## Backend Environment

Create `backend/.env` from the safe example and fill real production values:

```powershell
cd F:\basecamp\backend\backend
copy .env.example .env
```

Required production values:

```text
SERVER_PORT=8081
SPRING_PROFILES_ACTIVE=prod
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com
JWT_SECRET=<strong-base64-secret>
DB_URL=<production-jdbc-url>
DB_USERNAME=<production-db-user>
DB_PASSWORD=<production-db-password>
REDIS_HOST=<redis-host>
REDIS_PORT=6379
RABBITMQ_HOST=<rabbitmq-host>
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=<rabbitmq-user>
RABBITMQ_PASSWORD=<rabbitmq-password>
TURNSTILE_ENABLED=true
TURNSTILE_SECRET=<cloudflare-turnstile-secret>
```

For local browser testing against the backend, `CORS_ALLOWED_ORIGINS` must include the frontend origin:

```text
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

Add every actual dev origin you use, such as `http://localhost:3001` or `http://localhost:3100`. The browser error `Invalid CORS request` means the backend rejected the request before it reached the controller.

OAuth and SMTP values are optional until those flows are enabled.

## Start The Backend

```powershell
cd F:\basecamp\backend\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -DskipTests package
java -jar target\tiesverse-basecamp-learning-0.0.1-SNAPSHOT.jar
```

Health check:

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
```

## Frontend Environment

Create `frontend/.env.local` from the example:

```powershell
cd F:\basecamp\backend\frontend
copy .env.example .env.local
```

Set:

```text
NEXT_PUBLIC_API_BASE_URL=https://api.your-basecamp-domain.com
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<cloudflare-turnstile-site-key>
```

For deployed frontend builds, set these same variables in the hosting provider.
If the frontend and backend are on separate domains, `NEXT_PUBLIC_API_BASE_URL` must point to the backend origin and that frontend origin must be included in backend `CORS_ALLOWED_ORIGINS`.

## Start The Frontend

Development:

```powershell
cd F:\basecamp\backend\frontend
npm install
npm run dev
```

Production build:

```powershell
cd F:\basecamp\backend\frontend
npm run build
npm run start
```

## Production Checks

Before shipping:

```powershell
cd F:\basecamp\backend\frontend
npm run build
```

```powershell
cd F:\basecamp\backend\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -DskipTests package
```

Then verify:

- Frontend auth registration and login call the deployed backend.
- New registrations go through onboarding.
- Protected routes redirect unauthenticated users.
- Authenticated dashboard/profile/course/lesson/quiz/certificate screens load backend data.
- `TURNSTILE_ENABLED=true` works with production Cloudflare keys.

## Notes

- Do not commit `.env`, `.env.local`, database files, build output, or logs.
- The default backend profile is `prod`; set all required production environment variables before starting it.
- `frontend/.next/`, `frontend/node_modules/`, `backend/target/`, `backend/data/`, and logs are ignored.
