@echo off 
echo ======================================== 
echo    DARPAN - Starting Full System 
echo ======================================== 
echo. 
echo Starting Backend Server... 
start "DARPAN Backend" cmd /k "cd backend && npm run dev" 
timeout /t 3 /nobreak >nul 
echo Starting Frontend Application... 
start "DARPAN Frontend" cmd /k "cd frontend && npm start" 
echo. 
echo Both services are starting... 
echo Backend: http://localhost:5000 
echo Frontend: http://localhost:3000 
echo. 
pause 
