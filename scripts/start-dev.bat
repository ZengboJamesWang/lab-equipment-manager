@echo off
REM ======================================================
REM   Lab Equipment Manager v1.0.0 - Development Mode
REM ======================================================

echo ====================================================
echo   Lab Equipment Manager v1.0.0 - Development Mode
echo ====================================================
echo.

REM Check if Node.js is installed
echo [INFO] Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js is installed
node --version
echo.

REM Run the cross-platform Node.js script
echo [INFO] Starting development servers...
echo.
node "%~dp0start-dev.js"

REM If the script exits, pause
pause
