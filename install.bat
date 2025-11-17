@echo off
echo ========================================
echo Telehealth Video Call - Installation
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if MongoDB is installed
where mongod >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] MongoDB is not installed or not in PATH
    echo You can:
    echo 1. Install MongoDB locally from https://www.mongodb.com/try/download/community
    echo 2. Use MongoDB Atlas (cloud) - update MONGODB_URI in .env
    echo.
) else (
    echo [OK] MongoDB is installed
    mongod --version
    echo.
)

echo ========================================
echo Installing Backend Dependencies
echo ========================================
cd backend
if not exist package.json (
    echo [ERROR] backend/package.json not found!
    pause
    exit /b 1
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend installation failed!
    pause
    exit /b 1
)

echo [OK] Backend dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating backend .env file...
    copy .env.example .env
    echo [OK] Created backend/.env - Please update with your settings
) else (
    echo [OK] backend/.env already exists
)
echo.

cd ..

echo ========================================
echo Installing Frontend Dependencies
echo ========================================
cd frontend
if not exist package.json (
    echo [ERROR] frontend/package.json not found!
    pause
    exit /b 1
)

call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend installation failed!
    pause
    exit /b 1
)

echo [OK] Frontend dependencies installed
echo.

REM Create .env file if it doesn't exist
if not exist .env (
    echo Creating frontend .env file...
    copy .env.example .env
    echo [OK] Created frontend/.env
) else (
    echo [OK] frontend/.env already exists
)
echo.

cd ..

echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo.
echo 1. Start MongoDB (if using local):
echo    mongod
echo.
echo 2. Start Backend (in new terminal):
echo    cd backend
echo    npm run dev
echo.
echo 3. Start Frontend (in new terminal):
echo    cd frontend
echo    npm run dev
echo.
echo 4. Open browser:
echo    http://localhost:5173
echo.
echo For detailed instructions, see QUICKSTART.md
echo.
pause
