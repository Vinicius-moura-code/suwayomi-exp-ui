@echo off
setlocal
cd /d "%~dp0"
if not exist "package.json" (
  echo ERROR: run from suwayomi-exp-ui
  pause
  exit /b 1
)

if not exist "node_modules\next\dist\bin\next" (
  echo node_modules/next missing — running one-time setup...
  set CI=true
  call pnpm.cmd install --frozen-lockfile --ignore-scripts
  if errorlevel 1 (
    echo pnpm install failed
    pause
    exit /b 1
  )
  call pnpm.cmd run setup-env-files
)

if not exist ".env" (
  if exist ".env.template" copy /Y ".env.template" ".env" >nul
)

echo Starting Next.js on http://localhost:3000 ...
call node_modules\.bin\next.CMD dev
if errorlevel 1 call node .\node_modules\next\dist\bin\next dev
echo.
echo UI exited with code %ERRORLEVEL%
pause
