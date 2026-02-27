@echo off
echo.
echo =========================================
echo   Java Code Arena - Unified Server Setup
echo =========================================
echo.

REM Check if Node modules are installed
if not exist "frontend\node_modules" (
    echo Installing Node dependencies...
    cd frontend
    call npm install
    cd ..
    if errorlevel 1 (
        echo Error installing npm packages
        pause
        exit /b 1
    )
)

REM Build React frontend
echo.
echo Building React frontend...
cd frontend
call npm run build
cd ..
if errorlevel 1 (
    echo Error building React app
    pause
    exit /b 1
)

REM Check if Python dependencies are installed
if not exist "backend\.venv" (
    echo.
    echo Creating Python virtual environment...
    cd backend
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -r requirements.txt
    cd ..
) else (
    call backend\.venv\Scripts\activate.bat
)

REM Start the server
echo.
echo =========================================
echo Starting Java Code Arena Server
echo =========================================
echo Open your browser: http://localhost:5000
echo.
cd backend
python server.py
cd ..

pause
