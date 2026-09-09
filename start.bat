@echo off
echo ==============================================
echo       Starting ICSPP Management System
echo ==============================================

echo [0/2] Cleaning up any old processes...
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM dart.exe >nul 2>&1
timeout /t 1 /nobreak >nul

echo [1/2] Starting FastAPI Backend (PostgreSQL) on port 8000...
start "ICSPP Backend" cmd /k "cd /d %~dp0backend-python && python -m uvicorn main:app --host 127.0.0.1 --port 8000"

echo [2/2] Starting Flutter Web Frontend on port 8082...
start "ICSPP Frontend" cmd /k "cd /d %~dp0frontend_flutter && flutter run -d web-server --web-port 8082"

echo.
echo ============================================
echo  All services launched in separate windows!
echo ============================================
echo  Backend  : http://127.0.0.1:8000
echo  API Docs : http://127.0.0.1:8000/docs
echo  Frontend : http://localhost:8082
echo ============================================
echo.
pause
