@echo off
echo.
echo =========================================
echo   Java Code Arena - Unified Server Setup
echo =========================================
echo.

REM Check if Node modules are installed
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
    if errorlevel 1 (
        echo Error installing npm packages
        pause
        exit /b 1
    )
)

REM Build React frontend
echo.
echo Building React frontend...
call npm run build
if errorlevel 1 (
    echo Error building React app
    pause
    exit /b 1
)

REM Check if Python dependencies are installed
if not exist ".venv" (
    echo.
    echo Creating Python virtual environment...
    python -m venv .venv
    call .venv\Scripts\activate.bat
    echo Installing Python dependencies...
    pip install -r requirements.txt
) else (
    call .venv\Scripts\activate.bat
)

REM Start the server
echo.
echo =========================================
echo Starting Java Code Arena Server
echo =========================================
echo Open your browser: http://localhost:5000
echo.
python server.py

pause
