@echo off
setlocal

cd /d "%~dp0"

if not defined JAVA_HOME (
  if exist "C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot\bin\java.exe" (
    set "JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot"
  )
)

if not defined JAVA_HOME (
  echo JAVA_HOME is not set and no default JDK was found at the usual install path.
  echo Set JAVA_HOME to a JDK 21+ installation, then re-run this script.
  pause
  exit /b 1
)

if not exist ".env" (
  echo No .env file found next to this script.
  echo Copy .env.example to .env and fill in JWT_SECRET / DB_URL / DB_USERNAME / DB_PASSWORD first.
  pause
  exit /b 1
)

set "PATH=%JAVA_HOME%\bin;%PATH%"
set "SPRING_PROFILES_ACTIVE=cloud"

echo ==========================================================
echo  BaseCamp backend
echo  Profile: %SPRING_PROFILES_ACTIVE%  (uses DB_URL from .env, no local Redis/RabbitMQ needed)
echo  JAVA_HOME: %JAVA_HOME%
echo ==========================================================
echo.

call mvnw.cmd spring-boot:run

echo.
echo Backend process exited.
pause
