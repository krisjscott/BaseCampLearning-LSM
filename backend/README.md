# BaseCamp Spring Boot Backend

Spring Boot API for the BaseCamp learning platform.

## Runtime Profile

The default profile is `prod`. It expects production services through environment variables and uses the configured PostgreSQL-compatible database.

Create an ignored `.env` file:

```powershell
copy .env.example .env
```

Required production values:

```text
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8081
JWT_SECRET=<strong-base64-secret>
DB_URL=<production-jdbc-url>
DB_USERNAME=<production-db-user>
DB_PASSWORD=<production-db-password>
REDIS_HOST=<redis-host>
RABBITMQ_HOST=<rabbitmq-host>
RABBITMQ_USERNAME=<rabbitmq-user>
RABBITMQ_PASSWORD=<rabbitmq-password>
TURNSTILE_ENABLED=true
TURNSTILE_SECRET=<cloudflare-turnstile-secret>
```

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
