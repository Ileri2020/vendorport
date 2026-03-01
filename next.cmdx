@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

echo ================================
echo   Checking installed versions...
echo ================================

:: Get Next.js version
for /f "tokens=2 delims=: " %%a in ('npm ls next --json ^| findstr "version"') do (
    set NEXT_VERSION=%%a
    goto afterNext
)
:afterNext

:: Clean formatting (remove quotes, commas)
set NEXT_VERSION=%NEXT_VERSION:"=%
set NEXT_VERSION=%NEXT_VERSION:,=%

echo Next.js version: %NEXT_VERSION%

:: Get React version
for /f "tokens=2 delims=: " %%a in ('npm ls react --json ^| findstr "version"') do (
    set REACT_VERSION=%%a
    goto afterReact
)
:afterReact

set REACT_VERSION=%REACT_VERSION:"=%
set REACT_VERSION=%REACT_VERSION:,=%

echo React version: %REACT_VERSION%

echo.
echo ================================
echo   Checking for vulnerabilities
echo ================================

set VULNERABLE_NEXT=0
set VULNERABLE_REACT=0

:: Vulnerable Next.js versions: 15.x & 16.x (unpatched)
echo %NEXT_VERSION% | findstr /r "^15\." >nul && set VULNERABLE_NEXT=1
echo %NEXT_VERSION% | findstr /r "^16\." >nul && set VULNERABLE_NEXT=1

if %VULNERABLE_NEXT%==1 (
    echo ⚠️ WARNING: Your Next.js version %NEXT_VERSION% is vulnerable!
) else (
    echo ✅ Next.js is not in the known vulnerable range.
)

:: Vulnerable React versions
if "%REACT_VERSION%"=="19.0.0" set VULNERABLE_REACT=1
if "%REACT_VERSION%"=="19.1.0" set VULNERABLE_REACT=1
if "%REACT_VERSION%"=="19.1.1" set VULNERABLE_REACT=1
if "%REACT_VERSION%"=="19.2.0" set VULNERABLE_REACT=1

if %VULNERABLE_REACT%==1 (
    echo ⚠️ WARNING: Your React version %REACT_VERSION% is vulnerable!
) else (
    echo ✅ React is not one of the vulnerable versions.
)

echo.
echo ================================
echo      Updating to safe versions
echo ================================

set SAFE_NEXT=16.0.7
set SAFE_REACT=19.2.1

echo Installing Next.js %SAFE_NEXT% and React %SAFE_REACT%...

npm install next@%SAFE_NEXT% react@%SAFE_REACT% react-dom@%SAFE_REACT%

echo.
echo ================================
echo     Cleaning node_modules...
echo ================================

IF EXIST node_modules (
    rmdir /s /q node_modules
)

IF EXIST package-lock.json (
    del package-lock.json
)

echo.
echo Reinstalling dependencies...
npm install

echo.
echo ================================
echo        Running build
echo ================================

npm run build

echo.
echo ============================================
echo   🎉 Update Complete — System Now Secured
echo ============================================
ENDLOCAL
pause
