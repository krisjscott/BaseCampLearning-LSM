# BaseCamp Learning

BaseCamp is a learning and certification demo with a Next.js frontend and a Spring Boot backend. The local setup uses a file-based H2 database so registration, login, onboarding, dashboard data, profile edits, certificates, and notifications can be exercised without PostgreSQL, Redis, or RabbitMQ.

## Project Layout

- `frontend/app/` - Next.js app routes, UI, and backend API client.
- `frontend/public/` - logos and static frontend assets.
- `backend/` - runnable Spring Boot backend.
- `backend/data/` - generated local H2 database files. This folder is created when the backend runs.

## Requirements

- Node.js 20 or newer.
- npm.
- JDK 21.

On this machine the backend has been tested with Eclipse Temurin/Adoptium JDK 21.

## 1. Start The Backend With Local DB

Open PowerShell from the project root:

```powershell
cd F:\basecamp\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE="local"
.\mvnw.cmd spring-boot:run
```

The backend runs on:

```text
http://localhost:8081
```

The local database is stored at:

```text
F:\basecamp\backend\data\basecamp-local.mv.db
```

H2 console:

```text
http://localhost:8081/h2-console
```

Use these H2 console values:

```text
JDBC URL: jdbc:h2:file:./data/basecamp-local;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH
User: sa
Password: leave blank
```

The local profile automatically runs Flyway migrations and seeds demo data.

## 2. Start The Frontend

In a second PowerShell window from the project root:

```powershell
cd F:\basecamp\frontend
npm install
copy .env.example .env.local
npm run dev:local
```

The frontend runs on:

```text
http://127.0.0.1:3100
```

`.env.local` should contain:

```text
NEXT_PUBLIC_API_BASE_URL=http://localhost:8081
```

## Demo Login

Use the seeded demo account:

```text
Email: demo@basecamp.local
Password: password
```

New registrations are also saved to the local H2 database. After registering, the app sends the user through onboarding, saves onboarding details to the backend, and then shows local DB-backed dashboard/profile/certificate/notification data.

## Useful Checks

Frontend production build:

```powershell
cd F:\basecamp\frontend
npm run build
```

Backend build:

```powershell
cd F:\basecamp\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -DskipTests package
```

Backend health:

```powershell
Invoke-RestMethod http://localhost:8081/actuator/health
```

## Reset Local Demo Data

Stop the backend first, then delete the generated database files:

```powershell
Remove-Item F:\basecamp\backend\backend\data\basecamp-local* -Force
```

Start the backend again with `SPRING_PROFILES_ACTIVE=local`; Flyway will recreate and seed the local DB.

## Notes

- The frontend defaults to `http://localhost:8081` if `NEXT_PUBLIC_API_BASE_URL` is not set.
- The local backend profile disables Redis, RabbitMQ, mail health checks, and OAuth client auto-configuration so the demo runs with only Java and H2.
- Generated files under `frontend/.next/`, `frontend/node_modules/`, `backend/target/`, `backend/data/`, and logs are intentionally ignored.
