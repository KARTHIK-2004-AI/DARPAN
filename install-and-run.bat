@echo off
cls
echo ========================================
echo    DARPAN Production Setup
echo    Full-Stack Learning Platform
echo ========================================
echo.

:: Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org
    echo Minimum version: 16.0.0
    echo.
    pause
    exit /b 1
)

:: Display Node version
echo [INFO] Checking Node.js version...
node --version
echo.

:: Install dependencies
echo [INFO] Installing dependencies...
echo.
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo    Installation Complete!
echo ========================================
echo.
echo [SUCCESS] All dependencies installed
echo [SUCCESS] Database will be auto-created
echo [SUCCESS] Admin user will be auto-created
echo.
echo ========================================
echo    Starting DARPAN Server...
echo ========================================
echo.

:: Start the server
node server.js

pause