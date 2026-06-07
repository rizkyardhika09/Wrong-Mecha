@echo off
REM Batch mode: 3 signups with 5 min cooldown between
cd /d "%~dp0"
node src/main.js --batch 3
pause
