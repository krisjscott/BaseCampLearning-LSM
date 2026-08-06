@echo off
REM One-click launcher for backend (Spring Boot) + frontend (learner, :3100) + admin (:3101).
REM Usage: run-all.bat
setlocal
cd /d "%~dp0"

echo == BaseCamp: starting backend, frontend, and admin ==

if not exist "frontend\node_modules" (
    echo -- installing frontend dependencies --
    call npm install --prefix frontend
)

if not exist "admin\node_modules" (
    echo -- installing admin dependencies --
    call npm install --prefix admin
)

if not defined SPRING_PROFILES_ACTIVE set SPRING_PROFILES_ACTIVE=dev

start "BaseCamp backend (:8081)" cmd /k "cd /d "%~dp0backend" && set SPRING_PROFILES_ACTIVE=%SPRING_PROFILES_ACTIVE% && mvnw.cmd spring-boot:run"
start "BaseCamp frontend (:3100)" cmd /k "cd /d "%~dp0frontend" && npm run dev:local"
start "BaseCamp admin (:3101)" cmd /k "cd /d "%~dp0admin" && npm run dev:local"

echo.
echo All services starting in separate windows:
echo   Backend API   -^> http://localhost:8081
echo   Learner app   -^> http://localhost:3100
echo   Admin console -^> http://localhost:3101
echo.
echo Close each window to stop that service.
