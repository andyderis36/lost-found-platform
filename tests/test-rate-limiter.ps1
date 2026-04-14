#!/usr/bin/env pwsh

$baseUrl = "http://localhost:3000"
$loginUrl = "$baseUrl/api/auth/login"
$headers = @{"Content-Type" = "application/json"}

Write-Host ""
Write-Host "TEST 1: Server Health Check" -ForegroundColor Green
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/health" -UseBasicParsing -ErrorAction Stop
    Write-Host "   Status: 200 OK" -ForegroundColor Green
} catch {
    Write-Host "   FAILED" -ForegroundColor Red
    exit 1
}
Write-Host ""

# SCENARIO A: Wrong Credentials  
Write-Host "SCENARIO A: Wrong Credentials - 7 Attempts" -ForegroundColor Magenta
$wrongResults = @()
$wrongLimitHit = $false

for ($i = 1; $i -le 7; $i++) {
    $body = @{email = "test$i@test.com"; password = "wrong"} | ConvertTo-Json
    try {
        $r = Invoke-WebRequest -Uri $loginUrl -Method POST -Headers $headers -Body $body -UseBasicParsing -ErrorAction SilentlyContinue
        $status = $r.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
    }
    $wrongResults += $status
    if ($status -eq 429) { Write-Host "   Request $i : 429 RATE LIMITED" -ForegroundColor Green; $wrongLimitHit = $true }
    else { Write-Host "   Request $i : $status" -ForegroundColor Gray }
    Start-Sleep -Milliseconds 50
}
Write-Host "   Results: $($wrongResults -join ',')" -ForegroundColor Gray
Write-Host ""

Write-Host "SCENARIO B: Valid Credentials - 6 Attempts" -ForegroundColor Magenta
$validResults = @()
$validLimitHit = $false

for ($i = 1; $i -le 6; $i++) {
    $body = @{email = "joni@gmail.com"; password = "qwqw1234"} | ConvertTo-Json
    try {
        $r = Invoke-WebRequest -Uri $loginUrl -Method POST -Headers $headers -Body $body -UseBasicParsing -ErrorAction Stop
        $status = $r.StatusCode
    } catch {
        $status = $_.Exception.Response.StatusCode.Value__
    }
    $validResults += $status
    if ($status -eq 429) { Write-Host "   Request $i : 429 RATE LIMITED" -ForegroundColor Green; $validLimitHit = $true }
    else { Write-Host "   Request $i : $status" -ForegroundColor Gray }
    Start-Sleep -Milliseconds 50
}
Write-Host "   Results: $($validResults -join ',')" -ForegroundColor Gray
Write-Host ""

Write-Host "SUMMARY:" -ForegroundColor Cyan
if ($wrongLimitHit) { Write-Host "Scenario A: PASSED" -ForegroundColor Green } else { Write-Host "Scenario A: CHECK" -ForegroundColor Yellow }
if ($validLimitHit) { Write-Host "Scenario B: PASSED" -ForegroundColor Green } else { Write-Host "Scenario B: CHECK" -ForegroundColor Yellow }
if ($wrongLimitHit -and $validLimitHit) { Write-Host "FEATURE 1: COMPLETE" -ForegroundColor Green }
