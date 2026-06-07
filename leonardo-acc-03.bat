@echo off
REM ===== LEONARDO ACC 03 LAUNCHER + AUTO HELPER =====
set DATADIR=%TEMP%\Leonardo\Acc03
set EXT_PATH=%~dp0wrong-mecha-extension

if not exist "%DATADIR%" mkdir "%DATADIR%"

start chrome ^
  --user-data-dir="%DATADIR%" ^
  --load-extension="%EXT_PATH%" ^
  --new-window ^
  "https://www.canva.com/id_id/login/?redirect=%%2Fuser-profile" ^
  "https://temporary-email.net/en" ^
  "https://leonardo.ai/" ^
  "https://notion.so/