@echo off
REM ===== LEONARDO RESET ALL SLOTS =====
REM Clear all Acc 01-05 data (logout all + clear cookies)
REM Use when starting fresh batch signup session

echo This will DELETE all Chrome data for Acc 01-05.
echo Use to start FRESH signup batch.
echo.
set /p CONFIRM="Type YES to confirm: "
if /i not "%CONFIRM%"=="YES" exit

echo.
echo Clearing data...
rmdir /s /q "%TEMP%\Leonardo" 2>nul
mkdir "%TEMP%\Leonardo"
echo.
echo ✅ All slots reset. You can now launch any acc-XX.bat for fresh signup.
pause
exit
