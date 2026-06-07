@echo off
REM ===== LEONARDO ACC 01 LAUNCHER + AUTO HELPER EXTENSION =====
REM Isolated Chrome session + auto-loaded Wrong Mecha Helper extension
REM Plug-and-play: extension activates automatically on Canva/TempMail/Leonardo

set DATADIR=%TEMP%\Leonardo\Acc01
set EXT_PATH=%~dp0wrong-mecha-extension

if not exist "%DATADIR%" mkdir "%DATADIR%"

start chrome ^
  --user-data-dir="%DATADIR%" ^
  --load-extension="%EXT_PATH%" ^
  --new-window ^
  "https://www.canva.com/id_id/login/?redirect=%%2Fuser-profile" ^
  "https://temporary-email.net/en" ^
  "https://leonardo.ai/" ^
  "https://notion.so/cepat-digital/Akses-Tool-Box-Aff