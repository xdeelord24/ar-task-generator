@echo off
TITLE AR Generator App
echo ==========================================
echo      Starting AR Generator App
echo ==========================================

:: Check if Node is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed. Please install Node.js to continue.
    pause
    exit /b
)

:: Install dependencies if node_modules missing
if not exist "node_modules" (
    echo.
    echo [1/3] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing dependencies.
        pause
        exit /b
    )
) else (
    echo.
    echo [1/3] Dependencies found. Skipping install.
)

:: Build
echo.
echo [2/3] Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Error building application.
    pause
    exit /b
)

:: Run
echo.
echo [3/3] Starting production server...
echo.
echo Application will be available at http://localhost:4173
echo Press Ctrl+C to stop.
echo.
call npm run start:prod
pause
