@echo off
echo ========================================
echo    DARPAN - Revolutionary Learning Game
echo    Starting Development Environment
echo ========================================
echo.

:: Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ from https://nodejs.org
    pause
    exit /b 1
)

:: Check if MongoDB is running
echo Checking MongoDB connection...
mongosh --eval "db.runCommand('ping')" >nul 2>&1
if %errorlevel% neq 0 (
    echo WARNING: MongoDB is not running or not accessible
    echo Please start MongoDB service or check connection
    echo.
)

:: Navigate to project directory
cd /d "%~dp0comprehensive-game-platform"

:: Setup Backend
echo Setting up Backend...
cd backend
if not exist node_modules (
    echo Installing backend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install backend dependencies
        pause
        exit /b 1
    )
)

:: Check if .env exists
if not exist .env (
    echo Creating .env file...
    echo MONGODB_URI=mongodb://localhost:27017/darpan > .env
    echo JWT_SECRET=darpan-secret-key-2024 >> .env
    echo PORT=5000 >> .env
    echo NODE_ENV=development >> .env
    echo AI_API_KEY=your-ai-service-key >> .env
    echo .env file created with default values
    echo Please update the values as needed
    echo.
)

:: Setup Frontend
echo Setting up Frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing frontend dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    
    echo Installing additional game libraries...
    npm install three phaser react-spring framer-motion
)

:: Create startup batch files
echo Creating startup scripts...

:: Backend startup script
cd ..\backend
echo @echo off > start-backend.bat
echo echo Starting DARPAN Backend Server... >> start-backend.bat
echo npm run dev >> start-backend.bat
echo pause >> start-backend.bat

:: Frontend startup script
cd ..\frontend
echo @echo off > start-frontend.bat
echo echo Starting DARPAN Frontend Application... >> start-frontend.bat
echo npm start >> start-frontend.bat
echo pause >> start-frontend.bat

:: Main startup script
cd ..
echo @echo off > start-darpan.bat
echo echo ======================================== >> start-darpan.bat
echo echo    DARPAN - Starting Full System >> start-darpan.bat
echo echo ======================================== >> start-darpan.bat
echo echo. >> start-darpan.bat
echo echo Starting Backend Server... >> start-darpan.bat
echo start "DARPAN Backend" cmd /k "cd backend && npm run dev" >> start-darpan.bat
echo timeout /t 3 /nobreak ^>nul >> start-darpan.bat
echo echo Starting Frontend Application... >> start-darpan.bat
echo start "DARPAN Frontend" cmd /k "cd frontend && npm start" >> start-darpan.bat
echo echo. >> start-darpan.bat
echo echo Both services are starting... >> start-darpan.bat
echo echo Backend: http://localhost:5000 >> start-darpan.bat
echo echo Frontend: http://localhost:3000 >> start-darpan.bat
echo echo. >> start-darpan.bat
echo pause >> start-darpan.bat

echo.
echo ========================================
echo    DARPAN Setup Complete!
echo ========================================
echo.
echo Available commands:
echo   start-darpan.bat     - Start both backend and frontend
echo   backend/start-backend.bat - Start only backend server
echo   frontend/start-frontend.bat - Start only frontend app
echo.
echo URLs:
echo   Backend API: http://localhost:5000
echo   Frontend App: http://localhost:3000
echo   Game Interface: http://localhost:3000/game
echo.
echo Next Steps:
echo 1. Ensure MongoDB is running
echo 2. Run 'start-darpan.bat' to start the full system
echo 3. Open http://localhost:3000 in your browser
echo 4. Create a student account and start learning!
echo.
echo ========================================
echo    Ready to revolutionize education!
echo ========================================

pause