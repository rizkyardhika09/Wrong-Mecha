@echo off
REM ===== LEONARDO ACC 04 LAUNCHER =====
set DATADIR=%TEMP%\Leonardo\Acc04
if not exist "%DATADIR%" mkdir "%DATADIR%"

start chrome ^
  --user-data-dir="%DATADIR%" ^
  --new-window ^
  "https://www.canva.com/id_id/login/?redirect=%%2Fuser-profile" ^
  "https://temporary-email.net/en" ^
  "https://leonardo.ai/" ^
  "https://notion.so/cepat-digital/Akses-Tool-Box-Affiliate-Generator-2f3cb7f73bfb80028a2dc2019c7576fc"

exit
