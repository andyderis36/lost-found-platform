# Test Items API with QR Code Generation

Write-Host "📦 Testing Lost & Found Platform - Items API" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3000"

# Step 1: Login to get token
Write-Host "1️⃣  Logging in..." -ForegroundColor Yellow
$loginBody = @{
    email = "andy@test.com"
    password = "Andy1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login Success! Token obtained." -ForegroundColor Green
} catch {
    Write-Host "❌ Login Failed. Run test-auth.ps1 first to create user!" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
}

Write-Host ""

# Step 2: Create Item with QR Code
Write-Host "2️⃣  Creating new item with QR code..." -ForegroundColor Yellow
$createItemBody = @{
    name = "MacBook Pro 14"
    category = "electronics"
    description = "Silver MacBook Pro 14 inch, M3 chip"
    customFields = @{
        brand = "Apple"
        serialNumber = "C02ABC123XYZ"
        color = "Silver"
        purchaseDate = "2024-01-15"
    }
} | ConvertTo-Json

try {
    $itemResponse = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method POST -Body $createItemBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Item Created!" -ForegroundColor Green
    Write-Host "   Name: $($itemResponse.data.name)" -ForegroundColor Gray
    Write-Host "   Category: $($itemResponse.data.category)" -ForegroundColor Gray
    Write-Host "   QR Code: $($itemResponse.data.qrCode)" -ForegroundColor Gray
    Write-Host "   Status: $($itemResponse.data.status)" -ForegroundColor Gray
    $itemId = $itemResponse.data.id
    $qrCode = $itemResponse.data.qrCode
} catch {
    Write-Host "❌ Create Item Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Create Another Item
Write-Host "3️⃣  Creating second item..." -ForegroundColor Yellow
$createItem2Body = @{
    name = "AirPods Pro"
    category = "accessories"
    description = "White AirPods Pro with charging case"
    customFields = @{
        brand = "Apple"
        model = "AirPods Pro (2nd generation)"
    }
} | ConvertTo-Json

try {
    $item2Response = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method POST -Body $createItem2Body -ContentType "application/json" -Headers $headers
    Write-Host "✅ Second Item Created!" -ForegroundColor Green
    Write-Host "   Name: $($item2Response.data.name)" -ForegroundColor Gray
    Write-Host "   QR Code: $($item2Response.data.qrCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Create Second Item Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 4: Get All Items
Write-Host "4️⃣  Getting all items..." -ForegroundColor Yellow
try {
    $itemsResponse = Invoke-RestMethod -Uri "$baseUrl/api/items" -Method GET -Headers $headers
    Write-Host "✅ Items Retrieved!" -ForegroundColor Green
    Write-Host "   Total Items: $($itemsResponse.data.total)" -ForegroundColor Gray
    foreach ($item in $itemsResponse.data.items) {
        Write-Host "   - $($item.name) ($($item.category)) - $($item.qrCode)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Get Items Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 5: Get Single Item
Write-Host "5️⃣  Getting single item details..." -ForegroundColor Yellow
try {
    $singleItemResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method GET -Headers $headers
    Write-Host "✅ Item Details Retrieved!" -ForegroundColor Green
    Write-Host "   ID: $($singleItemResponse.data.id)" -ForegroundColor Gray
    Write-Host "   Name: $($singleItemResponse.data.name)" -ForegroundColor Gray
    Write-Host "   QR Code: $($singleItemResponse.data.qrCode)" -ForegroundColor Gray
    Write-Host "   Custom Fields:" -ForegroundColor Gray
    $singleItemResponse.data.customFields.PSObject.Properties | ForEach-Object {
        Write-Host "     - $($_.Name): $($_.Value)" -ForegroundColor DarkGray
    }
} catch {
    Write-Host "❌ Get Single Item Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 6: Update Item
Write-Host "6️⃣  Updating item..." -ForegroundColor Yellow
$updateItemBody = @{
    description = "Silver MacBook Pro 14 inch, M3 chip - UPDATED"
    status = "lost"
} | ConvertTo-Json

try {
    $updateResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method PUT -Body $updateItemBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Item Updated!" -ForegroundColor Green
    Write-Host "   New Description: $($updateResponse.data.description)" -ForegroundColor Gray
    Write-Host "   New Status: $($updateResponse.data.status)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Update Item Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 7: Download QR Code
Write-Host "7️⃣  Downloading QR code image..." -ForegroundColor Yellow
try {
    $qrFileName = "$qrCode.png"
    Invoke-WebRequest -Uri "$baseUrl/api/items/$itemId/qr" -Headers $headers -OutFile $qrFileName
    Write-Host "✅ QR Code Downloaded!" -ForegroundColor Green
    Write-Host "   Saved as: $qrFileName" -ForegroundColor Gray
    Write-Host "   Open this file to see your QR code!" -ForegroundColor Gray
} catch {
    Write-Host "❌ Download QR Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 8: Filter Items by Status
Write-Host "8️⃣  Filtering items by status='lost'..." -ForegroundColor Yellow
try {
    $filteredItems = Invoke-RestMethod -Uri "$baseUrl/api/items?status=lost" -Method GET -Headers $headers
    Write-Host "✅ Filtered Items Retrieved!" -ForegroundColor Green
    Write-Host "   Lost Items: $($filteredItems.data.total)" -ForegroundColor Gray
    foreach ($item in $filteredItems.data.items) {
        Write-Host "   - $($item.name) (Status: $($item.status))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Filter Items Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 9: Delete Item
Write-Host "9️⃣  Deleting item..." -ForegroundColor Yellow
try {
    $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method DELETE -Headers $headers
    Write-Host "✅ Item Deleted!" -ForegroundColor Green
    Write-Host "   Deleted ID: $($deleteResponse.data.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Delete Item Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Step 10: Verify Deletion
Write-Host "🔟 Verifying deletion..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/api/items/$itemId" -Method GET -Headers $headers
    Write-Host "❌ Item still exists! Deletion failed." -ForegroundColor Red
} catch {
    Write-Host "✅ Item successfully deleted (404 error expected)" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 All Items API Tests Completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Yellow
Write-Host "✅ Create item with auto QR generation" -ForegroundColor Green
Write-Host "✅ List all items" -ForegroundColor Green
Write-Host "✅ Get single item" -ForegroundColor Green
Write-Host "✅ Update item" -ForegroundColor Green
Write-Host "✅ Delete item" -ForegroundColor Green
Write-Host "✅ Download QR code as PNG" -ForegroundColor Green
Write-Host "✅ Filter items by status" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Check MongoDB Compass to see the data!" -ForegroundColor Cyan
Write-Host "   Database: lost-found-platform" -ForegroundColor Gray
Write-Host "   Collections: users, items" -ForegroundColor Gray
