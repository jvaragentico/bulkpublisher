@echo off
setlocal
cd /d "%~dp0"
if not exist package.json (
  echo Extract the complete ZIP first. This launcher must be beside package.json.
  pause
  exit /b 1
)
node --version >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 or later from https://nodejs.org/ then reopen this launcher.
  pause
  exit /b 1
)
if not exist node_modules\wrangler\bin\wrangler.js (
  call npm ci
  if errorlevel 1 goto failed
)
if not exist wrangler.local.json (
  call npm run setup:local
  if errorlevel 1 goto failed
)
echo Open http://127.0.0.1:8787 after the server says Ready.
echo Initial login: admin / admin
echo Keep this window open while using the dashboard. Press Ctrl+C to stop.
call npm start
if errorlevel 1 goto failed
exit /b 0
:failed
echo Setup or startup failed. Keep the error above when asking for help.
pause
exit /b 1
