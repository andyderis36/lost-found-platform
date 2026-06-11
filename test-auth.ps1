# Test Authentication API

Write-Host "🧪 Testing Lost & Found Platform Authentication" -ForegroundColor Cyan
Write-Host ""

# Base URL
$baseUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "1️⃣  Testing Health Check..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
    Write-Host "✅ Health Check: " -ForegroundColor Green -NoNewline
    Write-Host $health.message
} catch {
    Write-Host "❌ Health Check Failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Test 2: Register New User
Write-Host "2️⃣  Testing User Registration..." -ForegroundColor Yellow
$registerBody = @{
    email = "andy@test.com"
    name = "Andy Developer"
    password = "Andy1234"
    phone = "+6281234567890"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/register" -Method POST -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Registration Success!" -ForegroundColor Green
    Write-Host "   User: $($registerResponse.data.user.name)" -ForegroundColor Gray
    Write-Host "   Email: $($registerResponse.data.user.email)" -ForegroundColor Gray
    $token = $registerResponse.data.token
    Write-Host "   Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Registration Failed: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 409) {
        Write-Host "   User already exists, trying login..." -ForegroundColor Yellow
        
        # Try login instead
        $loginBody = @{
            email = "andy@test.com"
            password = "Andy1234"
        } | ConvertTo-Json
        
        $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
        Write-Host "✅ Login Success!" -ForegroundColor Green
        $token = $loginResponse.data.token
    } else {
        exit 1
    }
}

Write-Host ""

# Test 3: Login
Write-Host "3️⃣  Testing Login..." -ForegroundColor Yellow
$loginBody = @{
    email = "andy@test.com"
    password = "Andy1234"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login Success!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.data.user.name)" -ForegroundColor Gray
    $token = $loginResponse.data.token
} catch {
    Write-Host "❌ Login Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Current User (Protected Route)
Write-Host "4️⃣  Testing Protected Route (/api/auth/me)..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $meResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $headers
    Write-Host "✅ Protected Route Access Success!" -ForegroundColor Green
    Write-Host "   ID: $($meResponse.data.id)" -ForegroundColor Gray
    Write-Host "   Name: $($meResponse.data.name)" -ForegroundColor Gray
    Write-Host "   Email: $($meResponse.data.email)" -ForegroundColor Gray
    Write-Host "   Phone: $($meResponse.data.phone)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Protected Route Failed: $_" -ForegroundColor Red
}

Write-Host ""

# Test 5: Invalid Token
Write-Host "5️⃣  Testing Invalid Token (Should Fail)..." -ForegroundColor Yellow
$badHeaders = @{
    "Authorization" = "Bearer invalid_token_here"
}

try {
    $badResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/me" -Method GET -Headers $badHeaders
    Write-Host "❌ Should have failed but didn't!" -ForegroundColor Red
} catch {
    Write-Host "✅ Correctly rejected invalid token" -ForegroundColor Green
}

Write-Host ""
Write-Host "🎉 All Tests Completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Your JWT Token (save this):" -ForegroundColor Yellow
Write-Host $token -ForegroundColor White
