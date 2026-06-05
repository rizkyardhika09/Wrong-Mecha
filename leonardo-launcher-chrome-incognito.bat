@echo off
REM Leonardo Workflow Launcher — Chrome Incognito
REM Double-click to open 4 tabs in incognito Chrome
REM Each click = fresh incognito session (cookies cleared)

start chrome --incognito ^
  "https://www.canva.com/id_id/login/?redirect=%%2Fuser-profile" ^
  "https://temporary-email.net/en" ^
  "https://leonardo.ai/" ^
  "https://notion.so/cepat-digital/Akses-Tool-Box-Affiliate-Generator-2f3cb7f73bfb80028a2dc2019c7576fc"

exit
