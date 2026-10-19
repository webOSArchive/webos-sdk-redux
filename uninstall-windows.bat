@echo off
rem ==========================================================================
rem  webOS SDK Redux - Windows uninstaller
rem
rem  Removes the SDK, the PATH entry and the PDK. novacom is left to Windows'
rem  own uninstaller: it was installed by an MSI, so removing it here by hand
rem  would leave the installer database inconsistent. If this repo's novacomd had
rem  taken over the NovacomD service, the service is handed back to HP's first.
rem
rem  Usage:  uninstall-windows.bat [/y]
rem  Must be run from an elevated (Administrator) command prompt.
rem ==========================================================================

setlocal EnableDelayedExpansion
set "SDK_INSTALL_DIR=%ProgramFiles%\PalmSDK"
set "PDK_INSTALL_DIR=C:\PalmPDK"
set "BIN_DIR=%SDK_INSTALL_DIR%\Current\bin"
set "NOVACOMD_DIR=%SDK_INSTALL_DIR%\novacomd"
set "ASSUME_YES=0"
if /i "%~1"=="/y" set "ASSUME_YES=1"

echo.
echo ==========================================
echo   webOS SDK Redux - Windows Uninstaller
echo ==========================================
echo.

net session >nul 2>&1
if errorlevel 1 (
    echo [ERROR] This uninstaller must be run as Administrator.
    exit /b 1
)

echo This will remove:
echo   - %SDK_INSTALL_DIR%
echo   - %PDK_INSTALL_DIR%
echo   - %BIN_DIR% from the system PATH
if exist "%NOVACOMD_DIR%\novacomd.exe" echo   - this repo's novacomd, handing the NovacomD service back to HP's
echo.
echo novacom is NOT removed here. Uninstall "Palm Novacom" from
echo Settings ^> Apps, or: msiexec /x NovacomInstaller_^<arch^>.msi
echo.
if "%ASSUME_YES%"=="0" (
    set /p "CONFIRM=Continue? [y/N]: "
    if /i not "!CONFIRM!"=="y" ( echo Cancelled. & exit /b 0 )
)

rem Drop the PATH entry first, so a failure later cannot leave a dangling entry.
rem The directory is passed via the environment so spaces and parentheses in it
rem cannot break the command quoting.
set "PALMSDK_BIN=%BIN_DIR%"
powershell -NoProfile -ExecutionPolicy Bypass -Command ^
 "$b=$env:PALMSDK_BIN; $p=[Environment]::GetEnvironmentVariable('Path','Machine'); $n=(($p -split ';') | Where-Object {$_ -ne $b -and $_ -ne ''}) -join ';'; if($n -ne $p){[Environment]::SetEnvironmentVariable('Path',$n,'Machine'); Write-Host '[OK]   Removed from system PATH'} else {Write-Host '[INFO] Not present on system PATH'}"

rem This repo's novacomd runs from under the SDK directory, so it has to let go of
rem the NovacomD service before that directory can be deleted. HP's registration
rem was saved by install-windows.bat; without it, the service is just removed.
if exist "%NOVACOMD_DIR%\novacomd.exe" (
    net stop NovacomD >nul 2>&1
    if exist "%NOVACOMD_DIR%\hp-service.txt" (
        rem Line 1 is HP's path, line 2 its description. The path has spaces in it,
        rem under Program Files, so it goes back quoted in sc.exe's own form below:
        rem unquoted, Windows would try C:\Program.exe first.
        set "HP_PATH="
        set "HP_DESC="
        for /f "usebackq delims=" %%L in ("%NOVACOMD_DIR%\hp-service.txt") do (
            if not defined HP_PATH (set "HP_PATH=%%~L") else if not defined HP_DESC set "HP_DESC=%%L"
        )
        sc config NovacomD binPath= "\"!HP_PATH!\"" >nul
        if defined HP_DESC sc description NovacomD "!HP_DESC!" >nul
        sc start NovacomD >nul
        if errorlevel 1 (
            echo [WARN] Could not restart HP's novacomd - try: net start NovacomD
        ) else (
            echo [OK]   NovacomD service handed back to HP's novacomd
        )
    ) else (
        "%NOVACOMD_DIR%\novacomd.exe" -u
    )
)

rem The junction must go before the directory it points at, and rmdir (not
rem "rmdir /s") is what deletes a junction without following it into the target.
if exist "%SDK_INSTALL_DIR%\Current" (
    rmdir "%SDK_INSTALL_DIR%\Current" 2>nul && echo [OK]   Removed Current junction
)

if exist "%SDK_INSTALL_DIR%" (
    rmdir /s /q "%SDK_INSTALL_DIR%" 2>nul
    if exist "%SDK_INSTALL_DIR%" (
        echo [WARN] Could not fully remove %SDK_INSTALL_DIR%
        echo        Something may still be running from it.
    ) else (
        echo [OK]   Removed %SDK_INSTALL_DIR%
    )
) else (
    echo [INFO] No SDK found at %SDK_INSTALL_DIR%
)

rem Remove only the components this repo installs. Anything else under
rem C:\PalmPDK -- notably a full OEM PDK's toolchains -- is not ours to delete.
if exist "%PDK_INSTALL_DIR%" (
    for %%c in (include device share) do (
        if exist "%PDK_INSTALL_DIR%\%%c" (
            rmdir /s /q "%PDK_INSTALL_DIR%\%%c" 2>nul && echo [OK]   Removed PDK %%c
        )
    )
    dir /b /a "%PDK_INSTALL_DIR%" 2>nul | findstr "." >nul
    if errorlevel 1 (
        rmdir "%PDK_INSTALL_DIR%" 2>nul && echo [OK]   Removed %PDK_INSTALL_DIR%
    ) else (
        echo [WARN] %PDK_INSTALL_DIR% kept - it still contains items we did not install:
        dir /b /a "%PDK_INSTALL_DIR%" 2>nul
    )
) else (
    echo [INFO] No PDK found at %PDK_INSTALL_DIR%
)

echo.
echo [OK] Uninstallation complete
echo      Open a new terminal for the PATH change to take effect.
echo.
endlocal
