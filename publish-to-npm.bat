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

echo [1/3] Running tests...
call npm test
if errorlevel 1 goto :fail
echo.

echo Your npm account has two-factor authentication enabled, so publishing
echo needs a one-time code from your authenticator app (Google Authenticator,
echo Authy, 1Password, or the code npm emails you).
echo.
echo If you use an Automation token instead, just press Enter.
echo.
set "OTP="
set /p OTP=Enter your 6-digit code (or press Enter): 

echo.
echo [2/3] Publishing to the public registry...
if defined OTP (
  call npm publish --access public --otp=%OTP%
) else (
  call npm publish --access public
)
if errorlevel 1 goto :fail

echo.
echo [3/3] Verifying the published package...
call npx --yes type-ramp@1.0.0 --steps 3

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
echo.
echo  E403 / 2FA      - run again and enter a fresh code; codes expire in 30s
echo  E403 / name     - tell the agent, the package will be renamed
echo  E409 / conflict - version 1.0.0 already exists (already published?)
echo ============================================================
pause
exit /b 1
