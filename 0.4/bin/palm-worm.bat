@echo off
rem Windows launcher for palm-worm. Unlike the other commands this drives
rem worm.jar rather than webos-tools.jar, and needs an enlarged heap.
setlocal
call "%~dp0palm-common.bat"
if errorlevel 1 exit /b 1
if not exist "%JARS_DIR%\worm.jar" (
    echo error: worm.jar not found in "%JARS_DIR%"
    exit /b 1
)
"%JAVA_CMD%" -Xmx256m -Dpalm.command=palm-worm -jar "%JARS_DIR%\worm.jar" %*
endlocal
