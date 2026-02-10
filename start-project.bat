@echo off
echo ===============================
echo STARTING BAKALAURAS PROJECT
echo ===============================

REM 1. Start MySQL (XAMPP)
@REM echo Starting MySQL...
@REM start "" "C:\xampp\xampp-control.exe"

REM 2. Start Backend
echo Starting .NET backend...
start cmd /k "cd backend\Bakalauras.API && dotnet run"

REM 3. Start Frontend
echo Starting React frontend...
start cmd /k "cd frontend\react-app && npm start"

echo ===============================
echo ALL SERVICES STARTED
echo ===============================
pause
