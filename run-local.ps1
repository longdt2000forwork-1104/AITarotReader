# AI Tarot Reader - Local Dev Starter
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " STARTING AI TAROT READER (FULL STACK)" -ForegroundColor Cyan
Write-Host "   * Backend:  Spring Boot 3 (Port 8080)" -ForegroundColor Yellow
Write-Host "   * Database: Supabase Cloud PostgreSQL 17" -ForegroundColor Green
Write-Host "   * AI Model: Google Gemini 3.5 Flash Lite" -ForegroundColor Magenta
Write-Host "   * Frontend: Next.js 14 App Router (Port 3000)" -ForegroundColor Yellow
Write-Host "==============================================================================" -ForegroundColor Cyan

$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Write-Host "`n[1/2] Starting Spring Boot Backend in background window..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; `$env:JAVA_HOME='C:\Program Files\Java\jdk-17'; .\mvnw.cmd spring-boot:run"

Start-Sleep -Seconds 5

Write-Host "[2/2] Starting Next.js Frontend in background window..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"

Write-Host "`nServices are launching!" -ForegroundColor Green
Write-Host "  -> Frontend App:    http://localhost:3000/app/home" -ForegroundColor Cyan
Write-Host "  -> Reading Studio:  http://localhost:3000/app/readings/new" -ForegroundColor Cyan
Write-Host "  -> Backend API:     http://localhost:8080" -ForegroundColor Cyan
Write-Host "  -> Swagger Docs:    http://localhost:8080/swagger-ui.html" -ForegroundColor Cyan
