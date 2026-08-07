# BaseCamp Spring Boot Backend

Spring Boot API for the BaseCamp learning platform.

## Runtime Profile

The default profile is `prod`. It expects production services through environment variables and uses the configured PostgreSQL-compatible database.

Create an ignored `.env` file:

```powershell
copy .env.example .env
```

Set `SPRING_PROFILES_ACTIVE=prod` and provide database, JWT, OAuth, R2, SMTP, CORS, and other runtime values through the deployment platform's secret manager. The variable names and local-development placeholders are maintained in `.env.example`; secret values are intentionally not documented here.

Production migrations remove the local/demo accounts and sample course data. Set the three `INITIAL_ADMIN_*` values for the first start only, then remove `INITIAL_ADMIN_PASSWORD` from deployment secrets. The bootstrap is idempotent and only creates the account when that email does not already exist.

For local frontend testing against a backend running on `prod`, include the local browser origin in CORS:

```text
CORS_ALLOWED_ORIGINS=http://localhost:3100,http://localhost:3101,http://127.0.0.1:3100,http://127.0.0.1:3101
```

If the frontend runs on another port, add that exact origin too, for example `http://localhost:3001`. A missing origin causes Spring to return `Invalid CORS request` before the API controller is reached.

## Build

```powershell
$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
.\mvnw.cmd -DskipTests package
```

## Start

```powershell
java -jar target\tiesverse-basecamp-learning-0.0.1-SNAPSHOT.jar
```

Health check:

```text
http://localhost:8081/actuator/health
```
