@echo off
title NetraDhrishti Backend (Spring Boot :8080)
echo =======================================================
echo   Starting NetraDhrishti Backend Server (Port 8080)
echo   Note: Uses embedded Tomcat. No setup required!
echo =======================================================
cd /d "%~dp0backend"
call mvnw.cmd spring-boot:run
pause
