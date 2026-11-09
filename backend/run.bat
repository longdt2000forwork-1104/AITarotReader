@echo off
title AI Tarot Reader - Backend (Port 8080)
set JAVA_HOME=C:\Program Files\Java\jdk-17
set "PATH=%JAVA_HOME%\bin;%PATH%"
cd /d "%~dp0"

REM Load environment variables from .env if present
if exist "%~dp0.env" (
    echo [INFO] Loading configuration from %~dp0.env...
    for /f "usebackq eol=# tokens=1* delims==" %%a in ("%~dp0.env") do (
        if not "%%a"=="" if not "%%b"=="" (
            set "%%a=%%b"
        )
    )
)

echo [INFO] Active Profile: %SPRING_PROFILES_ACTIVE%
call mvnw.cmd spring-boot:run
