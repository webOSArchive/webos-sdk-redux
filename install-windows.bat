@echo off
rem ==========================================================================
rem  webOS SDK Redux - Windows installer
rem
rem  Installs three things:
rem    * the SDK        -> %ProgramFiles%\PalmSDK\<version>, with a Current junction
rem    * novacom        -> via HP's NovacomInstaller MSI (WinUSB driver + novacomd)
rem    * the PDK        -> C:\PalmPDK
rem
rem  Usage:  install-windows.bat [/y] [/sdkdir <path>] [/nopdk] [/nonovacom]
rem            /y          do not prompt for confirmation
rem            /sdkdir     override the SDK install directory
rem            /nopdk      skip the PDK
rem            /nonovacom  skip the novacom MSI
rem
rem  Must be run from an elevated (Administrator) command prompt.
rem ==========================================================================

setlocal EnableDelayedExpansion
set "SCRIPT_DIR=%~dp0"
if "%SCRIPT_DIR:~-1%"=="\" set "SCRIPT_DIR=%SCRIPT_DIR:~0,-1%"
rem This script lives at the repo root, so the root is simply its own directory.
set "REPO_ROOT=%SCRIPT_DIR%"

set "SDK_INSTALL_DIR=%ProgramFiles%\PalmSDK"
set "PDK_INSTALL_DIR=C:\PalmPDK"
set "ASSUME_YES=0"
set "DO_PDK=1"
set "DO_NOVACOM=1"

:parseargs
if "%~1"=="" goto argsdone
if /i "%~1"=="/y"         ( set "ASSUME_YES=1"        & shift & goto parseargs )
if /i "%~1"=="/nopdk"     ( set "DO_PDK=0"            & shift & goto parseargs )
if /i "%~1"=="/nonovacom" ( set "DO_NOVACOM=0"        & shift & goto parseargs )
if /i "%~1"=="/sdkdir"    ( set "SDK_INSTALL_DIR=%~2" & shift & shift & goto parseargs )
echo [ERROR] Unknown option: %~1
exit /b 1
:argsdone

echo.
echo ==========================================
echo   webOS SDK Redux - Windows Installer
echo ==========================================
echo.

rem --- must be elevated --------------------------------------------------
net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] This installer must be run as Administrator.
    echo         Right-click cmd.exe, choose "Run as administrator", then re-run.
    exit /b 1
)

rem --- architecture ------------------------------------------------------
rem PROCESSOR_ARCHITEW6432 is set when a 32-bit process runs on 64-bit Windows,
rem so checking it too avoids mis-detecting under a 32-bit cmd.exe.
set "ARCH=x86"
if /i "%PROCESSOR_ARCHITECTURE%"=="AMD64" set "ARCH=x64"
if defined PROCESSOR_ARCHITEW6432 set "ARCH=x64"
echo [INFO] Architecture: %ARCH%

rem ==========================================================================
echo.
echo [STEP] 1/4 - Checking prerequisites...
echo.

set "JAVA_CMD="
where java >nul 2>&1 && set "JAVA_CMD=java"
if not defined JAVA_CMD if defined JAVA_HOME if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
if not defined JAVA_CMD (
    echo [ERROR] Java not found - the SDK tools require Java 8 or greater
    echo         Install from https://adoptium.net/ and re-run.
    exit /b 1
)
rem No findstr here on purpose: piping through it would put four quote
rem characters in the for /f 'command' (the %JAVA_CMD% pair plus its own
rem "version" pair), and cmd.exe's /c only leaves a quoted command alone at
rem exactly two - past that it strips the line's first and last quote
rem instead, mangling "java" into java" and failing for every Java, any
rem version. The first line of "-version" output is always the version
rem line anyway, so the loop just takes that and skips the rest via
rem "if not defined" - no filtering needed.
set "JAVA_VER_RAW="
for /f tokens^=3 %%v in ('"%JAVA_CMD%" -version 2^>^&1') do (
    if not defined JAVA_VER_RAW set "JAVA_VER_RAW=%%~v"
)
set "JAVA_MAJOR="
for /f "tokens=1,2 delims=._-" %%a in ("%JAVA_VER_RAW%") do (
    if "%%a"=="1" ( set "JAVA_MAJOR=%%b" ) else ( set "JAVA_MAJOR=%%a" )
)
echo %JAVA_MAJOR%| findstr /r "^[0-9][0-9]*$" >nul || (
    echo [ERROR] Could not parse java version "%JAVA_VER_RAW%"
    exit /b 1
)
if %JAVA_MAJOR% LSS 8 (
    echo [ERROR] Java 8 or greater required ^(found %JAVA_VER_RAW%^)
    exit /b 1
)
echo [OK]   Java %JAVA_VER_RAW%

rem --- find the highest-numbered SDK folder, mirroring install.sh ---------
rem cmd wildcards are only * and ?; a "[0-9]*" glob would match a directory
rem literally named that, so enumerate everything and filter with findstr.
set "SDK_SRC="
set "SDK_VER="
for /d %%d in ("%REPO_ROOT%\*") do (
    set "CAND=%%~nxd"
    echo !CAND!| findstr /r "^[0-9][0-9.]*$" >nul
    if !errorlevel! EQU 0 (
        if not defined SDK_VER (
            set "SDK_VER=!CAND!" & set "SDK_SRC=%%~fd"
        ) else (
            if "!CAND!" GTR "!SDK_VER!" ( set "SDK_VER=!CAND!" & set "SDK_SRC=%%~fd" )
        )
    )
)
if not defined SDK_SRC (
    echo [ERROR] No SDK version directory found under "%REPO_ROOT%"
    exit /b 1
)
if not exist "!SDK_SRC!\share\jars\webos-tools.jar" (
    echo [ERROR] "!SDK_SRC!" is not an SDK tree ^(no share\jars\webos-tools.jar^)
    exit /b 1
)
if not exist "!SDK_SRC!\bin\palm-install.bat" (
    echo [ERROR] "!SDK_SRC!\bin" is missing the Windows launchers ^(palm-*.bat^)
    exit /b 1
)
echo [OK]   Found SDK !SDK_VER! at "!SDK_SRC!"

set "BIN_DIR=%SDK_INSTALL_DIR%\Current\bin"
echo.
echo [INFO] SDK      to "%SDK_INSTALL_DIR%\!SDK_VER!"
if "%DO_PDK%"=="1"     echo [INFO] PDK      to "%PDK_INSTALL_DIR%"
if "%DO_NOVACOM%"=="1" echo [INFO] novacom  via NovacomInstaller_%ARCH%.msi
echo [INFO] PATH     add "%BIN_DIR%"
echo.
if "%ASSUME_YES%"=="0" (
    set /p "CONFIRM=Continue with installation? [Y/n]: "
    if /i "!CONFIRM!"=="n" ( echo Cancelled. & exit /b 0 )
)

rem ==========================================================================
echo.
echo [STEP] 2/4 - Installing SDK...
echo.

rem Back up an existing install of the SAME version. A different version is left
rem alone -- Current is repointed below, so older trees are harmless, and
rem deleting someone's previous SDK is not this installer's call.
if exist "%SDK_INSTALL_DIR%\!SDK_VER!" (
    rem Get-Date rather than wmic: wmic is deprecated and absent from recent
    rem Windows 11 builds, which would break the backup on exactly the newest
    rem systems.
    for /f %%t in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd-HHmmss"') do set "TS=%%t"
    echo [INFO] Backing up existing !SDK_VER! to !SDK_VER!.backup.!TS!
    move /y "%SDK_INSTALL_DIR%\!SDK_VER!" "%SDK_INSTALL_DIR%\!SDK_VER!.backup.!TS!" >nul
    if errorlevel 1 (
        echo [ERROR] Could not back up the existing SDK
        exit /b 1
    )
)

mkdir "%SDK_INSTALL_DIR%\!SDK_VER!" 2>nul
robocopy "!SDK_SRC!" "%SDK_INSTALL_DIR%\!SDK_VER!" /E /NFL /NDL /NJH /NJS /NP >nul
rem robocopy uses bitmapped exit codes; anything under 8 means success.
if errorlevel 8 (
    echo [ERROR] Failed to copy the SDK
    exit /b 1
)
echo [OK]   SDK files installed

rem Current is a directory junction, not a symlink: junctions need no developer
rem mode or SeCreateSymbolicLink privilege, and we are already elevated.
if exist "%SDK_INSTALL_DIR%\Current" rmdir "%SDK_INSTALL_DIR%\Current" 2>nul
mklink /J "%SDK_INSTALL_DIR%\Current" "%SDK_INSTALL_DIR%\!SDK_VER!" >nul
if errorlevel 1 (
    echo [ERROR] Could not create the Current junction
    exit /b 1
)
echo [OK]   Current points at !SDK_VER!

rem Append to the machine PATH via PowerShell rather than setx: setx truncates
rem PATH at 1024 characters, which silently destroys a long system PATH.
rem The directory is handed over in an environment variable rather than
rem interpolated into the command text, so spaces and parentheses in the path
rem (C:\Program Files (x86)\...) cannot break the quoting.
set "PALMSDK_BIN=%BIN_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "$b=$env:PALMSDK_BIN; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); if(($p -split ';') -notcontains $b){[Environment]::SetEnvironmentVariable('Path',($p.TrimEnd(';')+';'+$b),'Machine'); Write-Host '[OK]   Added to system PATH'} else {Write-Host '[OK]   Already on system PATH'}"

rem ==========================================================================
echo.
echo [STEP] 3/4 - Installing novacom driver...
echo.
if "%DO_NOVACOM%"=="0" (
    echo [SKIP] novacom skipped by request
) else (
    rem The MSIs live in windows\; fall back to beside this script in case the
    rem two have been copied somewhere together.
    set "MSI=%REPO_ROOT%\windows\NovacomInstaller_%ARCH%.msi"
    if not exist "!MSI!" set "MSI=%SCRIPT_DIR%\NovacomInstaller_%ARCH%.msi"
    if not exist "!MSI!" (
        echo [WARN] "!MSI!" not found - skipping novacom
        echo        Without it nothing serves 127.0.0.1:6968, so palm-install,
        echo        palm-launch and palm-log cannot reach a device.
    ) else (
        echo [INFO] Running msiexec on NovacomInstaller_%ARCH%.msi
        msiexec /i "!MSI!" /passive /norestart
        if errorlevel 1 (
            echo [WARN] msiexec reported an error - novacom may not be installed
            echo        The driver package is WHQL-signed but dates from 2011.
            echo        See WINDOWS.md if Windows rejected it.
        ) else (
            echo [OK]   novacom installed
        )
    )
)

rem ==========================================================================
echo.
echo [STEP] 4/4 - Installing PDK...
echo.
if "%DO_PDK%"=="0" (
    echo [SKIP] PDK skipped by request
) else (
    if not exist "%REPO_ROOT%\pdk\include" (
        echo [WARN] "%REPO_ROOT%\pdk" not found - skipping PDK
    ) else (
        rem Only the host-agnostic parts. pdk\bin is bash and cannot run here.
        for %%c in (include device share) do (
            if exist "%REPO_ROOT%\pdk\%%c" (
                robocopy "%REPO_ROOT%\pdk\%%c" "%PDK_INSTALL_DIR%\%%c" /E /NFL /NDL /NJH /NJS /NP >nul
                if errorlevel 8 ( echo [WARN] Failed to copy pdk\%%c ) else ( echo [OK]   PDK %%c )
            )
        )
        echo [INFO] pdk\bin skipped - those helpers are bash scripts
    )
)

rem ==========================================================================
echo.
echo ==========================================
echo   Installation Complete
echo ==========================================
echo.
echo [INFO] SDK commands: "%BIN_DIR%"
if "%DO_PDK%"=="1" echo [INFO] PDK headers and ARM device libraries: "%PDK_INSTALL_DIR%" ^(no compiler^)
echo.

rem Probe the port the SDK actually depends on. The Java tools reach the device
rem by connecting to novacomd on 127.0.0.1:6968 -- they never shell out to a
rem novacom binary -- so this is the real readiness check. It also avoids
rem depending on the service name, which novacomd.exe registers itself via
rem "novacomd -i" rather than through a standard MSI ServiceInstall entry.
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "try{$c=New-Object Net.Sockets.TcpClient;$c.Connect('127.0.0.1',6968);$c.Close();Write-Host '[OK]   novacomd is listening on 127.0.0.1:6968'}catch{Write-Host '[WARN] Nothing is listening on 127.0.0.1:6968 - novacomd is not running.';Write-Host '       Start the Novacom service, or run novacomd.exe -i from its install dir.'}"

echo.
echo [INFO] Open a NEW terminal for the PATH change to take effect, then:
echo          palm-install --version
echo          palm-install -l
echo.
endlocal
