@echo off
setlocal
cd /d "%~dp0"
echo ============================================================
echo  npm publish: modular-type-ramp
echo ============================================================
echo.

call npm whoami >nul 2>&1
if errorlevel 1 (
  echo You are not logged in to npm yet.
  echo A browser window will open - sign in or create a free account.
  echo.
  pause
  call npm login
  if errorlevel 1 goto :fail
)

echo Logged in as:
call npm whoami
echo.

echo [1/2] Running tests...
call npm test
if errorlevel 1 goto :fail

echo.
echo [2/2] Publishing to the public registry...
call npm publish --access public
if errorlevel 1 goto :fail

echo.
echo ============================================================
echo  PUBLISHED
echo  https://www.npmjs.com/package/modular-type-ramp
echo  npm install modular-type-ramp
echo ============================================================
echo.
pause
exit /b 0

:fail
echo.
echo ============================================================
echo  PUBLISH FAILED - read the message above.
echo  If it says 403 "name taken", open an issue and I will rename.
echo ============================================================
pause
exit /b 1
