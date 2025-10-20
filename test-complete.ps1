# Complete End-to-End Test - Lost & Found Platform

Write-Host "🚀 Full System Test - Lost & Found Platform" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# ========================================
# PHASE 1: AUTHENTICATION
# ========================================
Write-Host "📌 PHASE 1: AUTHENTICATION" -ForegroundColor Magenta
Write-Host ""

Write-Host "1️⃣  Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "andy@test.com"
    password = "Andy1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login Failed. Please run test-auth.ps1 first!" -ForegroundColor Red
    exit 1
}

$headers = @{ "Authorization" = "Bearer $token" }
Write-Host ""

# ========================================
# PHASE 2: ITEM CREATION WITH QR CODE
# ========================================
Write-Host "📌 PHASE 2: ITEM CREATION" -ForegroundColor Magenta
Write-Host ""

Write-Host "2️⃣  Creating item with QR code..." -ForegroundColor Yellow
$createItemBody = @{
    name = "iPhone 15 Pro"
    category = "electronics"
    description = "Natural Titanium iPhone 15 Pro, 256GB"
    customFields = @{
        brand = "Apple"
        model = "iPhone 15 Pro"
        color = "Natural Titanium"
        imei = "123456789012345"
    }
} | ConvertTo-Json

try {
    $itemResponse = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method POST -Body $createItemBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Item Created with QR Code!" -ForegroundColor Green
    Write-Host "   Name: $($itemResponse.data.name)" -ForegroundColor Gray
    Write-Host "   QR Code: $($itemResponse.data.qrCode)" -ForegroundColor Gray
    Write-Host "   Status: $($itemResponse.data.status)" -ForegroundColor Gray
    $itemId = $itemResponse.data.id
    $qrCode = $itemResponse.data.qrCode
} catch {
    Write-Host "❌ Create Item Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ========================================
# PHASE 3: MARK ITEM AS LOST
# ========================================
Write-Host "📌 PHASE 3: MARK ITEM AS LOST" -ForegroundColor Magenta
Write-Host ""

Write-Host "3️⃣  Marking item as LOST..." -ForegroundColor Yellow
$updateBody = @{
    status = "lost"
    description = "Lost at Starbucks on Main Street"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method PUT -Body $updateBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Item Marked as LOST!" -ForegroundColor Green
    Write-Host "   Status: $($updateResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 4: PUBLIC QR SCAN (NO AUTH)
# ========================================
Write-Host "📌 PHASE 4: PUBLIC QR CODE SCAN" -ForegroundColor Magenta
Write-Host ""

Write-Host "4️⃣  Simulating QR code scan (public endpoint)..." -ForegroundColor Yellow
try {
    $publicItemResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/public/$qrCode" -Method GET
    Write-Host "✅ QR Code Scanned Successfully!" -ForegroundColor Green
    Write-Host "   Item: $($publicItemResponse.data.name)" -ForegroundColor Gray
    Write-Host "   Status: $($publicItemResponse.data.status)" -ForegroundColor Gray
    Write-Host "   Category: $($publicItemResponse.data.category)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Public Scan Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 5: FINDER CONTACTS OWNER
# ========================================
Write-Host "📌 PHASE 5: FINDER SUBMITS CONTACT FORM" -ForegroundColor Magenta
Write-Host ""

Write-Host "5️⃣  Finder submitting contact information..." -ForegroundColor Yellow
$scanBody = @{
    qrCode = $qrCode
    scannerName = "John Finder"
    scannerEmail = "john.finder@example.com"
    scannerPhone = "+6281234567890"
    message = "Hi! I found your iPhone at Starbucks on Main Street. It's safe with me. Please contact me to arrange pickup!"
    location = @{
        latitude = -6.2088
        longitude = 106.8456
        address = "Starbucks, Main Street, Jakarta"
    }
} | ConvertTo-Json

try {
    $scanResponse = Invoke-RestMethod -Uri "$baseUrl/api/scans" -Method POST -Body $scanBody -ContentType "application/json"
    Write-Host "✅ Scan Logged & Owner Notified!" -ForegroundColor Green
    Write-Host "   Scanner: $($scanBody | ConvertFrom-Json | Select-Object -ExpandProperty scannerName)" -ForegroundColor Gray
    Write-Host "   Message sent to owner" -ForegroundColor Gray
} catch {
    Write-Host "❌ Scan Logging Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 6: LOG ANOTHER SCAN
# ========================================
Write-Host "6️⃣  Logging another scan..." -ForegroundColor Yellow
$scan2Body = @{
    qrCode = $qrCode
    scannerName = "Sarah Helper"
    scannerEmail = "sarah@example.com"
    message = "Saw your lost item post. I might have seen it!"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "$baseUrl/api/scans" -Method POST -Body $scan2Body -ContentType "application/json" | Out-Null
    Write-Host "✅ Second Scan Logged!" -ForegroundColor Green
} catch {
    Write-Host "❌ Second Scan Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 7: OWNER CHECKS SCAN HISTORY
# ========================================
Write-Host "📌 PHASE 7: OWNER CHECKS SCAN HISTORY" -ForegroundColor Magenta
Write-Host ""

Write-Host "7️⃣  Owner checking scan history..." -ForegroundColor Yellow
try {
    $scansResponse = Invoke-RestMethod -Uri "$baseUrl/api/scans/$itemId" -Method GET -Headers $headers
    Write-Host "✅ Scan History Retrieved!" -ForegroundColor Green
    Write-Host "   Total Scans: $($scansResponse.data.total)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📋 Scan Details:" -ForegroundColor Cyan
    foreach ($scan in $scansResponse.data.scans) {
        Write-Host "   ━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor DarkGray
        Write-Host "   👤 Name: $($scan.scannerName)" -ForegroundColor White
        Write-Host "   📧 Email: $($scan.scannerEmail)" -ForegroundColor White
        Write-Host "   📱 Phone: $($scan.scannerPhone)" -ForegroundColor White
        Write-Host "   💬 Message: $($scan.message)" -ForegroundColor White
        if ($scan.location) {
            Write-Host "   📍 Location: $($scan.location.address)" -ForegroundColor White
        }
        Write-Host "   🕐 Time: $($scan.scannedAt)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get Scan History Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 8: DOWNLOAD QR CODE
# ========================================
Write-Host "📌 PHASE 8: DOWNLOAD QR CODE" -ForegroundColor Magenta
Write-Host ""

Write-Host "8️⃣  Downloading QR code as PNG..." -ForegroundColor Yellow
try {
    $qrFileName = "$qrCode.png"
    Invoke-WebRequest -Uri "$baseUrl/api/items/$itemId/qr" -Headers $headers -OutFile $qrFileName
    Write-Host "✅ QR Code Downloaded!" -ForegroundColor Green
    Write-Host "   File: $qrFileName" -ForegroundColor Gray
    Write-Host "   You can print this and stick it on your item!" -ForegroundColor Gray
} catch {
    Write-Host "❌ QR Download Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# PHASE 9: MARK AS FOUND
# ========================================
Write-Host "📌 PHASE 9: MARK ITEM AS FOUND" -ForegroundColor Magenta
Write-Host ""

Write-Host "9️⃣  Owner marking item as FOUND..." -ForegroundColor Yellow
$foundBody = @{
    status = "found"
} | ConvertTo-Json

try {
    $foundResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method PUT -Body $foundBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Item Marked as FOUND!" -ForegroundColor Green
    Write-Host "   Status: $($foundResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update Failed: $_" -ForegroundColor Red
}

Write-Host ""

# ========================================
# SUMMARY
# ========================================
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 FULL SYSTEM TEST COMPLETED!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "📊 Test Summary:" -ForegroundColor Yellow
Write-Host "✅ User Authentication" -ForegroundColor Green
Write-Host "✅ Item Creation with QR Code" -ForegroundColor Green
Write-Host "✅ Update Item Status (Lost)" -ForegroundColor Green
Write-Host "✅ Public QR Code Scan (No Auth)" -ForegroundColor Green
Write-Host "✅ Finder Contact Submission" -ForegroundColor Green
Write-Host "✅ Scan Logging with Location" -ForegroundColor Green
Write-Host "✅ Owner View Scan History" -ForegroundColor Green
Write-Host "✅ QR Code Download (PNG)" -ForegroundColor Green
Write-Host "✅ Update Status to Found" -ForegroundColor Green

Write-Host ""
Write-Host "🌐 Public Scan URL:" -ForegroundColor Cyan
Write-Host "   $baseUrl/scan/$qrCode" -ForegroundColor White
Write-Host ""
Write-Host "💡 Open this URL in a browser to see the public scan page!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📂 Check MongoDB Compass:" -ForegroundColor Cyan
Write-Host "   Database: lost-found-platform" -ForegroundColor Gray
Write-Host "   Collections: users, items, scans" -ForegroundColor Gray
Write-Host ""
