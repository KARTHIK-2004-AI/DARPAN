@echo off
echo ========================================
echo    DARPAN - Complete Learning Platform
echo    Starting Full System
echo ========================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from https://nodejs.org
    echo.
    echo After installing Node.js:
    echo 1. Run: npm install
    echo 2. Run: node server.js
    pause
    exit /b 1
)

:: Install dependencies if needed
if not exist node_modules (
    echo Installing dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

:: Start the server
echo Starting DARPAN Server...
echo.
echo 🌌 DARPAN Platform URLs:
echo ================================
echo 📚 Student Portal: http://localhost:3000
echo 🔧 Admin Dashboard: http://localhost:3000/admin
echo 🎮 Games Interface: http://localhost:3000/game
echo ================================
echo.
echo 👤 Default Admin Login:
echo Username: admin
echo Password: admin123
echo.
echo 🎯 Ready to revolutionize education!
echo.

node server.js