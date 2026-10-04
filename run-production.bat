@echo off
echo ===================================================
echo   ANNADATA NURSERY - Starting Production Servers
echo ===================================================

echo [1/2] Starting Node.js Express Backend on Port 5000...
start "ANNADATA Backend API" cmd /k "cd backend && npm start"

echo [2/2] Starting Vite Production Preview on Port 5173...
start "ANNADATA Frontend Web" cmd /k "cd frontend && npm run preview -- --port 5173 --host"

echo.
echo Application is starting!
echo Open http://localhost:5173 in your browser.
echo Admin Login: admin@annadata.com / admin123
echo ===================================================
pause
