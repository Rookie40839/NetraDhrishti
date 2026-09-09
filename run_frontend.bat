@echo off
title NetraDhrishti Frontend (React + Vite :5173)
echo =======================================================
echo   Starting NetraDhrishti Frontend UI (Port 5173)
echo =======================================================
cd /d "%~dp0frontend"
if not exist node_modules (
    echo First time run: Installing dependencies...
    call npm install
)
call npm run dev
pause
