@echo off
setlocal

:: Set the API key permanently right here for 1-click launch
set GEMINI_API_KEY=AIzaSyB90I40DCS4aujsRiifVG_jJwNoQ4M8f6w

echo ====================================
echo Starting the Goku Interactive Avatar
echo ====================================
echo Opening application in your browser...

:: Wait 3 seconds for the server to spin up, then open default web browser
start "" cmd /c "timeout /t 3 /nobreak > nul & start http://localhost:8000"

:: Start the Python backend server
call .\venv\Scripts\activate
uvicorn backend.main:app --host 127.0.0.1 --port 8000
