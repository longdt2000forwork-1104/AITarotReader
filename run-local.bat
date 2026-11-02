@echo off
title AI Tarot Reader Runner
echo ==============================================================================
echo STARTING AI TAROT READER (FULL STACK)
echo   * Backend:  Spring Boot 3 (Port 8080)
echo   * Database: Supabase Cloud PostgreSQL 17
echo   * AI Model: Google Gemini 3.5 Flash Lite
echo   * Frontend: Next.js 14 App Router (Port 3000)
echo ==============================================================================

if "%JAVA_HOME%"=="" (
    set "JAVA_HOME=C:\Program Files\Java\jdk-17"
)
set "PATH=%JAVA_HOME%\bin;%PATH%"

echo [1/2] Starting Spring Boot Backend...
start "AI Tarot Reader - Backend (Port 8080)" cmd /k "cd backend && mvnw.cmd spring-boot:run"

echo Waiting for backend initialization...
timeout /t 5 /nobreak > nul

echo [2/2] Starting Next.js Frontend...
start "AI Tarot Reader - Frontend (Port 3000)" cmd /k "cd frontend && npm run dev"

echo.
echo ==============================================================================
echo Both services are launching in separate windows!
echo   - Web App UI:       http://localhost:3000/app/home
echo   - Reading Studio:   http://localhost:3000/app/readings/new
echo   - Backend API:      http://localhost:8080
echo   - Swagger Docs:     http://localhost:8080/swagger-ui.html
echo ==============================================================================
