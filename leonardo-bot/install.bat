@echo off
REM One-time install: npm dependencies + Playwright Chromium browser

cd /d "%~dp0"
echo.
echo ============================================
echo Leonardo Bot - One-Time Install
echo ============================================
echo.
echo Step 1: Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo.
    echo ERROR: npm install failed.
    echo Make sure Node.js is installed: https://nodejs.org
    pause
    exit /b 1
)
echo.
echo Step 2: Installing Chromium browser for Playwright...
call npx playwright install chromium
if errorlevel 1 (
    echo.
    echo ERROR: Playwright browser install failed.
    pause
    exit /b 1
)
echo.
echo ============================================
echo INSTALL COMPLETE
echo ============================================
echo.
echo Run start.bat to start a signup.
echo Run start-batch-3.bat for batch mode.
echo.
pause
