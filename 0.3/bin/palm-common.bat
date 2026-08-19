@echo off
rem
rem Shared launcher logic for the palm-* commands on Windows.
rem
rem Not a command itself -- each palm-<name>.bat "call"s this to resolve JAVA_CMD
rem and JARS_DIR, then invokes java itself. Deliberately does NOT use
rem setlocal/endlocal: the caller wraps the whole thing in its own setlocal, and
rem the variables set here must survive back into it.
rem
rem The Unix equivalents are the palm-* bash scripts beside this file. There is
rem no Cygwin path translation here (as palm-worm does) because a native batch
rem file already runs with native Windows paths.
rem

rem --- locate java -------------------------------------------------------
set "JAVA_CMD="
where java >nul 2>&1 && set "JAVA_CMD=java"
if not defined JAVA_CMD (
    if defined JAVA_HOME (
        if exist "%JAVA_HOME%\bin\java.exe" set "JAVA_CMD=%JAVA_HOME%\bin\java.exe"
    )
)
if not defined JAVA_CMD (
    echo error: java not found in PATH and JAVA_HOME is not set
    echo The webOS SDK tools require Java 8 or greater.
    echo Download from https://adoptium.net/ or https://www.oracle.com/java/
    exit /b 1
)

rem --- check the version -------------------------------------------------
rem "java -version" prints to stderr, hence the 2^>^&1. The token looks like
rem   1.8.0_432   (old scheme -> major is the second component)
rem   17.0.1      (new scheme -> major is the first)
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
if not defined JAVA_VER_RAW (
    echo error: could not determine java version from "%JAVA_CMD%"
    exit /b 1
)

set "JAVA_MAJOR="
for /f "tokens=1,2 delims=._-" %%a in ("%JAVA_VER_RAW%") do (
    if "%%a"=="1" ( set "JAVA_MAJOR=%%b" ) else ( set "JAVA_MAJOR=%%a" )
)
if not defined JAVA_MAJOR (
    echo error: could not parse java version "%JAVA_VER_RAW%"
    exit /b 1
)

rem A non-numeric major would make the comparison below silently misbehave.
echo %JAVA_MAJOR%| findstr /r "^[0-9][0-9]*$" >nul || (
    echo error: could not parse java version "%JAVA_VER_RAW%"
    exit /b 1
)
if %JAVA_MAJOR% LSS 8 (
    echo error: java 8 or greater is required ^(found %JAVA_VER_RAW%^)
    exit /b 1
)

rem --- locate the jars ---------------------------------------------------
rem %~dp0 is this script's directory, with a trailing backslash.
for %%d in ("%~dp0..\share\jars") do set "JARS_DIR=%%~fd"
if not exist "%JARS_DIR%\webos-tools.jar" (
    echo error: webos-tools.jar not found in "%JARS_DIR%"
    exit /b 1
)

exit /b 0
