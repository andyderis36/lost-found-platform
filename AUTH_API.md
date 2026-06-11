# 🔐 Authentication API - Complete!

## ✅ Endpoints Created

### 1. **POST /api/auth/register**
Register new user with email, password, and name.

**Features:**
- ✅ Email validation
- ✅ Password strength check (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
- ✅ Duplicate email check
- ✅ Password hashing with bcrypt
- ✅ Auto-generate JWT token
- ✅ Return user info

**Request:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "Secure123",
  "phone": "+6281234567890" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67...",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+6281234567890"
    }
  }
}
```

---

### 2. **POST /api/auth/login**
Login with email and password.

**Features:**
- ✅ Email validation
- ✅ Password verification with bcrypt
- ✅ Generate new JWT token
- ✅ Return user info

**Request:**
```json
{
  "email": "user@example.com",
  "password": "Secure123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "67...",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+6281234567890"
    }
  }
}
```

---

### 3. **GET /api/auth/me** 🔒 Protected
Get current user information (requires JWT token).

**Features:**
- ✅ JWT token verification
- ✅ Extract user from token
- ✅ Return full user profile
- ✅ Exclude password hash

**Request Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "67...",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+6281234567890",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

---

## 🧪 Testing

### Quick Test (PowerShell)

Run the automated test script:
```powershell
.\test-auth.ps1
```

This will test:
1. Health check
2. User registration
3. Login
4. Protected route access
5. Invalid token rejection

### Manual Testing

See `API_TESTING.md` for detailed manual testing instructions.

---

## 🔒 Security Features

- ✅ **Password Hashing:** bcrypt with salt rounds = 10
- ✅ **JWT Tokens:** 7-day expiration
- ✅ **Email Validation:** Regex format check
- ✅ **Password Strength:** Min 8 chars, mixed case, numbers
- ✅ **Duplicate Prevention:** Unique email constraint
- ✅ **Protected Routes:** JWT verification middleware
- ✅ **Error Handling:** Proper status codes & messages

---

## 📝 Error Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | Success | Login successful |
| 201 | Created | User registered |
| 400 | Bad Request | Invalid email format |
| 401 | Unauthorized | Invalid token |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Database error |

---

## 🗄️ Database

Check MongoDB Compass to see the data:

**Connection:** `mongodb://localhost:27017`  
**Database:** `lost-found-platform`  
**Collection:** `users`

**Sample User Document:**
```json
{
  "_id": "67...",
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+6281234567890",
  "passwordHash": "$2a$10$...",
  "createdAt": "2025-10-20T...",
  "updatedAt": "2025-10-20T...",
  "__v": 0
}
```

---

## 🚀 Next Steps

Now that authentication is done, we can build:

1. **Item Management API**
   - Create item with QR code
   - List user's items
   - Update/delete items

2. **QR Code Features**
   - Generate QR code image
   - Download QR code
   - Public scan page

3. **Scan Tracking**
   - Log scans
   - Contact owner
   - Location tracking

---

## 💡 Usage in Frontend

```typescript
// Register
const register = async (email: string, name: string, password: string) => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, name, password }),
  });
  const data = await response.json();
  localStorage.setItem('token', data.data.token);
  return data;
};

// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  localStorage.setItem('token', data.data.token);
  return data;
};

// Get Current User
const getCurrentUser = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('/api/auth/me', {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return await response.json();
};
```

---

**Authentication System Complete! ✅**
