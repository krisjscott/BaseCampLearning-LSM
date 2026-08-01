# BaseCamp Spring Boot Backend

Spring Boot API for the BaseCamp learning demo.

## Local Profile

The `local` profile is the recommended demo mode. It uses file-based H2 and does not require PostgreSQL, Redis, RabbitMQ, mail, or OAuth credentials.

```powershell
cd F:\basecamp\backend\backend
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE="local"
.\mvnw.cmd spring-boot:run
```

Service URL:

```text
http://localhost:8081
```

Health check:

```text
http://localhost:8081/actuator/health
```

H2 console:

```text
http://localhost:8081/h2-console
```

H2 console values:

```text
JDBC URL: jdbc:h2:file:./data/basecamp-local;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH
User: sa
Password: leave blank
```

Generated DB file:

```text
F:\basecamp\backend\backend\data\basecamp-local.mv.db
```

## Demo Account

```text
Email: demo@basecamp.local
Password: password
```

## What The Local DB Seeds

- Demo user account and profile.
- User settings.
- Demo organization.
- Course catalogue.
- Enrollments and progress.
- Certificate record.
- Notifications.
- Recent activity.

Fresh registrations are also persisted. The registration flow creates account, profile, settings, and starter demo experience rows so the frontend can immediately show a complete learning journey after onboarding.

## Build

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -DskipTests package
```

## Reset Local DB

Stop the backend, then delete:

```powershell
Remove-Item F:\basecamp\backend\backend\data\basecamp-local* -Force
```

Start the local profile again and Flyway will recreate the schema and seed data.
