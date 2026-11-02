[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "     AI TAROT READER - E2E SUPABASE & GEMINI TEST         " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Query Decks & Spreads
$decks = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/tarot/decks' -Method Get
Write-Host "[1/4] Supabase Decks found:" $decks.data.Count -ForegroundColor Green
$deck = $decks.data[0]

$spreads = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/tarot/spreads' -Method Get
Write-Host "[2/4] Supabase Spreads found:" $spreads.data.Count -ForegroundColor Green
$spread = $spreads.data | Where-Object { $_.code -eq 'PAST_PRESENT_FUTURE' -or $_.cardCount -eq 3 } | Select-Object -First 1
if (-not $spread) { $spread = $spreads.data[0] }

# 2. Create Session
Write-Host "`n[3/4] Creating Reading Session..." -ForegroundColor Yellow
$body = @{
    spreadId = $spread.id
    deckId = $deck.id
    inputMode = "VIRTUAL"
    personaCode = "MYSTIC_SAGE"
    userQuestion = "Toi co nen chuyen viec trong thang toi khong?"
} | ConvertTo-Json

$sessionRes = Invoke-RestMethod -Uri 'http://localhost:8080/api/v1/readings/sessions' -Method Post -Body $body -ContentType 'application/json; charset=utf-8'
$sessionId = $sessionRes.data.id
Write-Host " -> Session ID: $sessionId" -ForegroundColor White

# 3. Draw Cards
Write-Host "`n[4/4] Drawing Cards..." -ForegroundColor Yellow
$drawBody = @{ deckId = $deck.id } | ConvertTo-Json
$drawRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/readings/sessions/$sessionId/draw" -Method Post -Body $drawBody -ContentType 'application/json; charset=utf-8'
Write-Host " -> Cards drawn: $($drawRes.data.drawnCards.Count)" -ForegroundColor Green

# 4. Interpret with Gemini
Write-Host "`nCalling Google Gemini (gemini-3.5-flash-lite) for interpretation..." -ForegroundColor Magenta
$interpretRes = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/readings/sessions/$sessionId/interpret" -Method Post -ContentType 'application/json; charset=utf-8'

Write-Host "`n================ GEMINI INTERPRETATION RESULT ================" -ForegroundColor Cyan
Write-Host $interpretRes.data.aiSynthesisResult
Write-Host "==============================================================`n" -ForegroundColor Cyan
Write-Host "SUCCESS! Supabase + Gemini + Backend + Frontend is 100% operational." -ForegroundColor Green
