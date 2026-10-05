@echo off
rem Windows launcher for palm-log -- see palm-log (bash) for the Unix equivalent.
rem The jar dispatches on the palm.command property via command.properties.
setlocal
call "%~dp0palm-common.bat"
if errorlevel 1 exit /b 1
"%JAVA_CMD%" -Dpalm.command=palm-log -jar "%JARS_DIR%\webos-tools.jar" %*
endlocal
