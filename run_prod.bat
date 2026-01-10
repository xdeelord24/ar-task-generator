@echo off
echo Starting AR Generator in Production Mode...
cd /d "%~dp0"
call npm run start:prod
pause
