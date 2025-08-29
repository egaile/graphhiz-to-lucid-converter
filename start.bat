@echo off
REM Graphviz to Lucidchart Converter - Start Script
REM Quick start script for Windows

setlocal enabledelayedexpansion

REM Colors (Windows 10+)
set "RED=[31m"
set "GREEN=[32m"
set "YELLOW=[33m"
set "BLUE=[34m"
set "NC=[0m"

REM ASCII Art Header
echo %BLUE%
echo ============================================
echo    Graphviz to Lucidchart Converter
echo    Local-first DOT file conversion tool
echo ============================================
echo %NC%
echo.

REM Check Node.js installation
echo %YELLOW%Checking requirements...%NC%
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo %RED%X Node.js is not installed%NC%
    echo.
    echo Please install Node.js ^(version 16 or higher^) from:
    echo   https://nodejs.org
    echo.
    echo Download the Windows Installer and run it.
    echo.
    pause
    exit /b 1
)

REM Get Node version
for /f "tokens=1" %%i in ('node -v') do set NODE_VERSION=%%i
echo %GREEN%✓ Node.js %NODE_VERSION% detected%NC%

for /f "tokens=1" %%i in ('npm -v') do set NPM_VERSION=%%i
echo %GREEN%✓ npm %NPM_VERSION% detected%NC%

REM Check if dependencies are installed
if not exist "node_modules" (
    echo.
    echo %YELLOW%Installing dependencies...%NC%
    echo This may take a few minutes on first run.
    call npm install --production
    if %errorlevel% neq 0 (
        echo %RED%X Failed to install dependencies%NC%
        pause
        exit /b 1
    )
    echo %GREEN%✓ Dependencies installed%NC%
) else (
    echo %GREEN%✓ Dependencies already installed%NC%
)

REM Check if port 3000 is available
netstat -an | findstr :3000 | findstr LISTENING >nul 2>&1
if %errorlevel% equ 0 (
    echo.
    echo %YELLOW%Warning: Port 3000 is already in use%NC%
    echo Another instance might be running or another app is using this port.
    echo.
    set /p USE_ALT_PORT="Do you want to use a different port? (y/n): "
    if /i "!USE_ALT_PORT!"=="y" (
        set /p PORT="Enter port number (e.g., 3001): "
        echo %BLUE%Using port !PORT!%NC%
    ) else (
        echo Please stop the other application first.
        pause
        exit /b 1
    )
) else (
    set PORT=3000
)

REM Start the application
echo.
echo %GREEN%Starting Graphviz to Lucidchart Converter...%NC%
echo ------------------------------------------------
echo.
echo %BLUE%Web Interface:%NC% http://localhost:%PORT%
echo %BLUE%Status:%NC% Starting server...
echo.
echo Tips:
echo   - Drag and drop DOT files into the browser
echo   - Choose export format ^(draw.io or Lucid^)
echo   - Convert and download results as ZIP
echo.
echo %YELLOW%Press Ctrl+C to stop the server%NC%
echo ------------------------------------------------
echo.

REM Start the server
if exist "dist\index.html" (
    REM Production mode
    call npm run preview -- --port %PORT% --host localhost
) else (
    REM Development mode
    call npm run dev -- --port %PORT% --host localhost
)

pause