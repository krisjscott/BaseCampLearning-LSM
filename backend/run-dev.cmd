@echo off
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-21.0.8.9-hotspot
set SPRING_PROFILES_ACTIVE=dev
set SERVER_PORT=8081
cd /d %~dp0
call .\mvnw.cmd spring-boot:run
