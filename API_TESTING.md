# API Testing Guide

## Authentication Endpoints Testing

### 1. Test Registration

**Endpoint:** `POST /api/auth/register`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"name\":\"Test User\",\"password\":\"Test1234\",\"phone\":\"+6281234567890\"}"
```

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    name = "Test User"
    password = "Test1234"
    phone = "+6281234567890"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "phone": "+6281234567890"
    }
  }
}
```

---

### 2. Test Login

**Endpoint:** `POST /api/auth/login`

**Request:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"test@example.com\",\"password\":\"Test1234\"}"
```

**PowerShell:**
```powershell
$body = @{
    email = "test@example.com"
    password = "Test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "test@example.com",
      "name": "Test User",
      "phone": "+6281234567890"
    }
  }
}
```

---

### 3. Test Get Current User (Protected Route)

**Endpoint:** `GET /api/auth/me`

**Request:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**PowerShell:**
```powershell
$token = "YOUR_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET -Headers $headers
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+6281234567890",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

---

## Error Cases Testing

### 1. Register with Existing Email
```powershell
$body = @{
    email = "test@example.com"
    name = "Another User"
    password = "Test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Status 409 - "User with this email already exists"

---

### 2. Login with Wrong Password
```powershell
$body = @{
    email = "test@example.com"
    password = "WrongPassword123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Status 401 - "Invalid email or password"

---

### 3. Access Protected Route Without Token
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method GET
```

**Expected:** Status 401 - "Unauthorized - Invalid or missing token"

---

### 4. Register with Weak Password
```powershell
$body = @{
    email = "weak@example.com"
    name = "Weak User"
    password = "weak"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Status 400 - Password validation error

---

### 5. Register with Invalid Email
```powershell
$body = @{
    email = "invalid-email"
    name = "Invalid User"
    password = "Test1234"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

**Expected:** Status 400 - "Invalid email format"

---

## Testing Workflow

1. **Register a new user** → Save the token
2. **Login with same user** → Verify token is returned
3. **Get current user** → Use token from login
4. **Test error cases** → Verify proper error handling

---

## Using Postman (Recommended)

1. **Import Collection:**
   - Create new collection: "Lost & Found API"
   - Add requests for each endpoint

2. **Environment Variables:**
   - `baseUrl`: http://localhost:3000
   - `token`: (set after login/register)

3. **Test Scripts:**
   ```javascript
   // In login/register request
   pm.environment.set("token", pm.response.json().data.token);
   ```

---

## VS Code REST Client

Create `.http` file:

```http
### Register
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "name": "Test User",
  "password": "Test1234",
  "phone": "+6281234567890"
}

### Login
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test1234"
}

### Get Current User
GET http://localhost:3000/api/auth/me
Authorization: Bearer YOUR_TOKEN_HERE
```

---

**Happy Testing! 🚀**
