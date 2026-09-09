@echo off
cd /d "C:\inetpub\wwwroot\icspp-migration\backend"
echo Stopping any existing backend on port 5001...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5001" ^| find "LISTENING"') do taskkill /f /pid %%a 2>nul
echo Starting ICSPP Backend on port 5001...
start "ICSPP Backend" /b node src/server.js
echo Backend started successfully in the background!
pause
