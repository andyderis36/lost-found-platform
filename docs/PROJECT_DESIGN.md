# Lost & Found Platform - Project Design Document

**Project Title:** Lost & Found Platform  
**Project ID:** PID154  
**Course:** Final Year Project - STIZK3993  

**Student Information:**  
- **Name:** ANDYDERIS PUTRA AJI SYABANA  
- **Matric No:** 296530  
- **Programme:** Information Technology  

**Institution:** UNIVERSITI UTARA MALAYSIA  
**Date:** November 2025  
**Version:** 2.0

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [User Interface Design](#user-interface-design)
6. [Security Design](#security-design)
7. [Email System Design](#email-system-design)
8. [Deployment Architecture](#deployment-architecture)
9. [Technology Stack](#technology-stack)
10. [Future Enhancements](#future-enhancements)

---

## Executive Summary

### Project Overview
The Lost & Found Platform is a comprehensive web application designed to help reunite lost items with their owners through QR code technology. The system allows users to register valuable items, generate unique QR codes, and facilitate anonymous communication between finders and owners.

### Key Features
- User authentication with email verification
- Item registration with QR code generation
- Anonymous contact system
- GPS location tracking
- Email notifications
- Admin dashboard
- Role-based access control

### Target Users
1. **Item Owners** - People who want to protect their valuable items
2. **Finders** - People who find lost items and want to return them
3. **Administrators** - Platform managers who oversee operations

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js 15 Frontend (React 19 + TypeScript)         │  │
│  │  - Pages (App Router)                                 │  │
│  │  - Components (Navbar, ImageCropper)                  │  │
│  │  - Contexts (AuthContext)                             │  │
│  │  - Tailwind CSS Styling                               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Next.js API Routes                                   │  │
│  │  - Authentication (login, register, verify, reset)    │  │
│  │  - Items (CRUD operations)                            │  │
│  │  - Scans (tracking and contact)                       │  │
│  │  - Admin (user and item management)                   │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Business Logic Layer                                 │  │
│  │  - JWT Authentication                                 │  │
│  │  - Role-Based Access Control                          │  │
│  │  - Image Compression                                  │  │
│  │  - QR Code Generation                                 │  │
│  │  - Email Service Integration                          │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MongoDB Atlas Database                               │  │
│  │  - Users Collection                                   │  │
│  │  - Items Collection                                   │  │
│  │  - Scans Collection                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────┐ │
│  │  Resend API    │  │  Geolocation   │  │  Google Maps │ │
│  │  Email Service │  │  API           │  │  Integration │ │
│  └────────────────┘  └────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Application Flow

#### 1. User Registration Flow
```
User Registration
      ↓
Enter Details (name, email, phone, password)
      ↓
Frontend Validation
      ↓
Send to API (/api/auth/register)
      ↓
Backend Validation
      ↓
Hash Password (bcrypt)
      ↓
Generate Verification Token (32-byte hex)
      ↓
Save User to Database (emailVerified: false)
      ↓
Send Verification Email (Resend API)
      ↓
Display Success Message
      ↓
User Checks Email
      ↓
Click Verification Link
      ↓
Verify Token (/api/auth/verify-email)
      ↓
Update User (emailVerified: true)
      ↓
Redirect to Login
```

#### 2. Item Registration & QR Flow
```
User Logs In
      ↓
Navigate to "Create Item"
      ↓
Fill Item Details
      ↓
Upload Photo (optional)
      ↓
Frontend Image Compression (80-95% size reduction)
      ↓
Generate Unique QR Code (nanoid)
      ↓
Save to Database
      ↓
Display Item with QR Code
      ↓
Download QR Code Option
      ↓
Print & Attach to Item
```

#### 3. Scan & Contact Flow
```
Item is Lost
      ↓
Finder Scans QR Code
      ↓
Redirect to Public Page (/scan/[qrCode])
      ↓
Display Item Details
      ↓
Show Contact Form
      ↓
Finder Fills Form (name, email, phone, message)
      ↓
Get GPS Location (browser API)
      ↓
Reverse Geocode to Address
      ↓
Submit to API (/api/scans)
      ↓
Save Scan Log to Database
      ↓
Send Email Notification to Owner
      ↓
Email Includes:
  - Finder Contact Info
  - GPS Location (Google Maps link)
  - Action Buttons (View Location, WhatsApp)
      ↓
Owner Receives Email
      ↓
Owner Contacts Finder
      ↓
Item Reunited!
```

---

## Database Design

### Entity Relationship Diagram

```
┌─────────────────────┐
│       Users         │
├─────────────────────┤
│ _id (PK)            │
│ email (UNIQUE)      │
│ name                │
│ phone               │
│ passwordHash        │
│ role                │
│ emailVerified       │
│ verificationToken   │
│ verificationExpires │
│ resetPasswordToken  │
│ resetPasswordExpires│
│ createdAt           │
│ updatedAt           │
└─────────────────────┘
         │ 1
         │
         │ has many
         │
         ▼ N
┌─────────────────────┐
│       Items         │
├─────────────────────┤
│ _id (PK)            │
│ userId (FK)         │────────┐
│ qrCode (UNIQUE)     │        │
│ name                │        │
│ category            │        │
│ description         │        │
│ image               │        │
│ customFields        │        │
│ status              │        │
│ createdAt           │        │
│ updatedAt           │        │
└─────────────────────┘        │
         │ 1                   │
         │                     │
         │ has many            │
         │                     │
         ▼ N                   │
┌─────────────────────┐        │
│       Scans         │        │
├─────────────────────┤        │
│ _id (PK)            │        │
│ itemId (FK)         │────────┘
│ scannerName         │
│ scannerEmail        │
│ scannerPhone        │
│ location            │
│   - latitude        │
│   - longitude       │
│   - address         │
│ message             │
│ scannedAt           │
└─────────────────────┘
```

### Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,                     // Primary Key
  email: String (unique, indexed),   // User email
  name: String,                      // Full name
  phone: String (optional),          // Phone with country code
  passwordHash: String,              // Bcrypt hashed password
  role: Enum['user', 'admin'],       // User role
  emailVerified: Boolean,            // Email verification status
  verificationToken: String,         // Email verification token
  verificationTokenExpires: Date,    // Token expiry (24 hours)
  resetPasswordToken: String,        // Password reset token
  resetPasswordExpires: Date,        // Token expiry (1 hour)
  createdAt: Date,                   // Account creation date
  updatedAt: Date                    // Last update date
}

// Indexes
- email: unique index
- role: regular index
- emailVerified: regular index
```

#### Items Collection
```javascript
{
  _id: ObjectId,                     // Primary Key
  userId: ObjectId (ref: Users),     // Owner reference
  qrCode: String (unique, indexed),  // Unique QR identifier
  name: String,                      // Item name
  category: Enum[                    // Item category
    'Electronics',
    'Personal Items',
    'Bags & Luggage',
    'Jewelry',
    'Documents',
    'Keys',
    'Sports Equipment',
    'Other'
  ],
  description: String (optional),    // Item description
  image: String (optional),          // Base64 encoded image
  customFields: Object (optional),   // Flexible metadata
  status: Enum[                      // Item status
    'active',
    'lost',
    'found',
    'inactive'
  ],
  createdAt: Date,                   // Item registration date
  updatedAt: Date                    // Last update date
}

// Indexes
- qrCode: unique index
- userId: regular index
- status: regular index
- category: regular index
```

#### Scans Collection
```javascript
{
  _id: ObjectId,                     // Primary Key
  itemId: ObjectId (ref: Items),     // Item reference
  scannerName: String (optional),    // Finder's name
  scannerEmail: String (optional),   // Finder's email
  scannerPhone: String (optional),   // Finder's phone
  location: {                        // GPS location
    latitude: Number,
    longitude: Number,
    address: String (optional)       // Reverse geocoded address
  },
  message: String (optional),        // Message to owner
  scannedAt: Date                    // Scan timestamp
}

// Indexes
- itemId: regular index
- scannedAt: regular index (for sorting)
```

### Database Optimization

1. **Indexing Strategy**
   - Unique indexes on `email` and `qrCode` for fast lookups
   - Regular indexes on frequently queried fields
   - Compound indexes for common query patterns

2. **Data Validation**
   - Mongoose schema validation at application level
   - Email format validation
   - Password strength validation
   - Required field enforcement

3. **Performance Optimization**
   - Connection pooling with caching
   - Lean queries for read-only operations
   - Selective field projection to reduce data transfer

---

## API Design

### Authentication APIs

#### POST /api/auth/register
**Description:** Register a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "phone": "+62812345678",
  "password": "SecurePass123"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email to verify your account.",
  "data": null
}
```

**Errors:**
- 400: Invalid input or weak password
- 409: Email already exists
- 500: Server error

---

#### POST /api/auth/login
**Description:** Login with email and password

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "+62812345678",
      "role": "user"
    }
  }
}
```

**Errors:**
- 400: Missing credentials
- 401: Invalid credentials
- 403: Email not verified
- 500: Server error

---

#### GET /api/auth/verify-email?token=xxx
**Description:** Verify email with token

**Query Parameters:**
- `token`: Email verification token

**Response (200):**
```json
{
  "success": true,
  "message": "Email verified successfully",
  "data": null
}
```

**Errors:**
- 400: Invalid or expired token
- 500: Server error

---

#### POST /api/auth/forgot-password
**Description:** Request password reset

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset link has been sent to your email.",
  "data": null
}
```

**Errors:**
- 400: Invalid email
- 404: Email not found
- 500: Server error

---

#### POST /api/auth/reset-password
**Description:** Reset password with token

**Request Body:**
```json
{
  "token": "abc123...",
  "password": "NewSecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful. You can now login.",
  "data": null
}
```

**Errors:**
- 400: Invalid/expired token or weak password
- 500: Server error

---

### Items APIs

#### GET /api/items
**Description:** Get all items for authenticated user

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: Filter by status (active, lost, found, inactive)
- `category`: Filter by category
- `search`: Search by name

**Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "qrCode": "abc123xyz",
        "name": "iPhone 15 Pro",
        "category": "Electronics",
        "description": "Space Gray, 256GB",
        "image": "data:image/jpeg;base64,...",
        "customFields": {
          "imei": "123456789012345"
        },
        "status": "active",
        "scanCount": 3,
        "createdAt": "2025-11-01T10:00:00.000Z",
        "updatedAt": "2025-11-06T15:30:00.000Z"
      }
    ],
    "total": 10,
    "stats": {
      "total": 10,
      "active": 7,
      "lost": 2,
      "found": 1,
      "inactive": 0
    }
  }
}
```

---

#### POST /api/items
**Description:** Create a new item

**Headers:**
- `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "iPhone 15 Pro",
  "category": "Electronics",
  "description": "Space Gray, 256GB",
  "image": "data:image/jpeg;base64,...",
  "customFields": {
    "imei": "123456789012345",
    "serialNumber": "ABC123XYZ789"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "item": {
      "id": "507f1f77bcf86cd799439011",
      "qrCode": "abc123xyz",
      "name": "iPhone 15 Pro",
      "category": "Electronics",
      "status": "active",
      "createdAt": "2025-11-06T10:00:00.000Z"
    }
  }
}
```

---

#### GET /api/items/[id]
**Description:** Get specific item details

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "item": {
      "id": "507f1f77bcf86cd799439011",
      "qrCode": "abc123xyz",
      "name": "iPhone 15 Pro",
      "category": "Electronics",
      "description": "Space Gray, 256GB",
      "image": "data:image/jpeg;base64,...",
      "customFields": {
        "imei": "123456789012345"
      },
      "status": "active",
      "scanCount": 3,
      "createdAt": "2025-11-01T10:00:00.000Z"
    }
  }
}
```

---

### Scans APIs

#### POST /api/scans
**Description:** Log a scan (public endpoint, no auth required)

**Request Body:**
```json
{
  "qrCode": "abc123xyz",
  "scannerName": "Jane Smith",
  "scannerEmail": "jane@example.com",
  "scannerPhone": "+62812345678",
  "location": {
    "latitude": -8.5833,
    "longitude": 115.2167,
    "address": "Ubud, Bali, Indonesia"
  },
  "message": "I found your phone at the coffee shop"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Scan logged successfully. The owner has been notified.",
  "data": null
}
```

---

#### GET /api/scans/[itemId]
**Description:** Get scan history for an item

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "scans": [
      {
        "id": "507f1f77bcf86cd799439011",
        "scannerName": "Jane Smith",
        "scannerEmail": "jane@example.com",
        "scannerPhone": "+62812345678",
        "location": {
          "latitude": -8.5833,
          "longitude": 115.2167,
          "address": "Ubud, Bali, Indonesia"
        },
        "message": "I found your phone",
        "scannedAt": "2025-11-06T15:30:00.000Z"
      }
    ],
    "total": 3
  }
}
```

---

### Admin APIs

#### GET /api/admin/stats
**Description:** Get platform statistics (admin only)

**Headers:**
- `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 150,
      "regular": 145,
      "admins": 5
    },
    "items": {
      "total": 500,
      "active": 450,
      "found": 30,
      "inactive": 20,
      "byCategory": [
        { "category": "Electronics", "count": 200 },
        { "category": "Personal Items", "count": 150 }
      ]
    },
    "scans": {
      "total": 1250,
      "recent": []
    }
  }
}
```

---

#### GET /api/admin/users
**Description:** Get all users (admin only)

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `role`: Filter by role (user, admin)
- `verified`: Filter by verification status (true, false)
- `search`: Search by name or email

**Response (200):**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "507f1f77bcf86cd799439011",
        "email": "user@example.com",
        "name": "John Doe",
        "phone": "+62812345678",
        "role": "user",
        "emailVerified": true,
        "itemCount": 5,
        "createdAt": "2025-10-01T10:00:00.000Z"
      }
    ],
    "total": 150
  }
}
```

---

## User Interface Design

### Design System

#### Color Palette
```
Primary Colors:
- Blue: #2563eb (bg-blue-600)
- Purple: #9333ea (accent)

Status Colors:
- Success: #10b981 (green-500)
- Warning: #f59e0b (yellow-500)
- Error: #ef4444 (red-500)
- Info: #3b82f6 (blue-500)

Neutral Colors:
- Gray-50 to Gray-900 (backgrounds, text)
```

#### Typography
```
Headings:
- H1: text-4xl font-bold (36px)
- H2: text-3xl font-bold (30px)
- H3: text-2xl font-bold (24px)
- H4: text-xl font-semibold (20px)

Body:
- Regular: text-base (16px)
- Small: text-sm (14px)
- Extra Small: text-xs (12px)
```

#### Spacing
```
Padding/Margin Scale:
- xs: 0.5rem (2)
- sm: 0.75rem (3)
- md: 1rem (4)
- lg: 1.5rem (6)
- xl: 2rem (8)
- 2xl: 3rem (12)
```

### Page Layouts

#### 1. Home Page (/)
```
┌─────────────────────────────────────────┐
│            Navbar                        │
├─────────────────────────────────────────┤
│                                          │
│          Hero Section                    │
│     "Protect Your Valuables"             │
│     [Get Started] [Learn More]           │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│        Features Section                  │
│   [QR Code] [Track] [Notify]             │
│                                          │
├─────────────────────────────────────────┤
│                                          │
│        How It Works                      │
│   1→Register  2→QR  3→Attach             │
│                                          │
├─────────────────────────────────────────┤
│              Footer                      │
└─────────────────────────────────────────┘
```

#### 2. Dashboard (/dashboard)
```
┌─────────────────────────────────────────┐
│            Navbar                        │
├─────────────────────────────────────────┤
│  Dashboard                               │
│  [Statistics Cards Row]                  │
│  Total Items | Active | Scans            │
├─────────────────────────────────────────┤
│  Search & Filter                         │
│  [Search] [Status▼] [Category▼] [+New]  │
├─────────────────────────────────────────┤
│  Items Grid                              │
│  ┌──────┐ ┌──────┐ ┌──────┐            │
│  │Item 1│ │Item 2│ │Item 3│            │
│  │ QR   │ │ QR   │ │ QR   │            │
│  └──────┘ └──────┘ └──────┘            │
└─────────────────────────────────────────┘
```

#### 3. Item Detail (/items/[id])
```
┌─────────────────────────────────────────┐
│            Navbar                        │
├─────────────────────────────────────────┤
│  [← Back]              [Edit] [Delete]  │
├─────────────────────────────────────────┤
│  ┌──────────┐  Item Details              │
│  │          │  Name: iPhone 15 Pro       │
│  │  Image   │  Category: Electronics     │
│  │          │  Status: [Active ▼]        │
│  └──────────┘  Description...            │
├─────────────────────────────────────────┤
│  QR Code Section                         │
│     ┌─────────┐                          │
│     │   QR    │  [Download QR]           │
│     │  CODE   │  [Copy Link]             │
│     └─────────┘                          │
├─────────────────────────────────────────┤
│  Scan History (3 scans)                  │
│  ┌────────────────────────────────────┐ │
│  │ Jane Smith                          │ │
│  │ jane@example.com | +62812345678     │ │
│  │ 📍 Ubud, Bali | Nov 6, 3:30 PM     │ │
│  │ "I found your phone..."             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 4. Public Scan Page (/scan/[qrCode])
```
┌─────────────────────────────────────────┐
│         Lost & Found Platform            │
├─────────────────────────────────────────┤
│                                          │
│  ┌──────────┐                           │
│  │          │  iPhone 15 Pro             │
│  │  Image   │  Electronics               │
│  │          │  Space Gray, 256GB         │
│  └──────────┘                           │
│                                          │
├─────────────────────────────────────────┤
│  📞 Contact Owner                        │
│                                          │
│  Your Name: [____________]               │
│  Email:     [____________]               │
│  Phone:     [+__ ________]               │
│  Message:   [____________]               │
│            [____________]                │
│                                          │
│  📍 Location: Auto-detected              │
│  Ubud, Bali, Indonesia                   │
│                                          │
│            [Submit Contact]              │
│                                          │
└─────────────────────────────────────────┘
```

#### 5. Admin Dashboard (/admin)
```
┌─────────────────────────────────────────┐
│            Navbar (Admin)                │
├─────────────────────────────────────────┤
│  Admin Dashboard                         │
│  Platform statistics and management      │
├─────────────────────────────────────────┤
│  Quick Links                             │
│  [👥 Manage Users] [📦 Items] [🏠 User]│
├─────────────────────────────────────────┤
│  Statistics Cards                        │
│  [👥 Users] [📦 Items] [✨ Found] [📱 Scans]
├─────────────────────────────────────────┤
│  Items by Category                       │
│  Electronics: 200  Personal: 150         │
├─────────────────────────────────────────┤
│  Recent Scans                            │
│  Jane Smith - iPhone 15 Pro              │
│  Nov 6, 3:30 PM                          │
└─────────────────────────────────────────┘
```

#### 6. Admin Users (/admin/users)
```
┌─────────────────────────────────────────┐
│            Navbar (Admin)                │
├─────────────────────────────────────────┤
│  User Management                         │
│  [← Back to Admin]                       │
├─────────────────────────────────────────┤
│  Filters                                 │
│  [Search] [Role▼] [Verification▼]       │
│  [Search] [Reset]                        │
├─────────────────────────────────────────┤
│  Users Table                             │
│  ┌────────────────────────────────────┐│
│  │USER    CONTACT  STATUS    ITEMS    ││
│  │John    +628..   user      5        ││
│  │        john@..  verified           ││
│  │                                     ││
│  │Jane    +628..   admin     0        ││
│  │        jane@..  verified           ││
│  └────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Security Design

### Authentication & Authorization

#### JWT Token Structure
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "role": "user",
  "iat": 1699276800,
  "exp": 1699363200
}
```

**Token Expiry:** 24 hours  
**Storage:** localStorage (client-side)  
**Transmission:** Authorization header (`Bearer <token>`)

#### Password Security
- **Algorithm:** bcrypt
- **Salt Rounds:** 10
- **Min Length:** 6 characters
- **Validation:** Length check only (flexible for users)
- **Storage:** Hashed in database

#### Role-Based Access Control (RBAC)

```
┌─────────────────────────────────────────┐
│              Roles                       │
├─────────────────────────────────────────┤
│                                          │
│  USER ROLE                               │
│  - View own items                        │
│  - Create/edit/delete own items          │
│  - View scan history for own items       │
│  - Update profile                        │
│                                          │
│  ADMIN ROLE                              │
│  - All user permissions                  │
│  - View all users                        │
│  - View all items                        │
│  - Edit user roles                       │
│  - Delete users                          │
│  - View platform statistics              │
│  - Manage system                         │
│                                          │
└─────────────────────────────────────────┘
```

#### Middleware Protection

```javascript
// Protected routes require authentication
Middleware: requireAuth
  ├─ /api/items/*
  ├─ /api/auth/me
  └─ /dashboard

// Admin routes require admin role
Middleware: requireAdmin
  ├─ /api/admin/*
  └─ /admin/*

// Public routes (no auth required)
Public:
  ├─ /api/auth/login
  ├─ /api/auth/register
  ├─ /api/scans (POST only)
  └─ /scan/[qrCode]
```

### Data Security

#### Input Validation
```javascript
// Email validation
const emailRegex = /^\S+@\S+\.\S+$/;

// Password validation
const passwordMinLength = 6;

// Phone validation
// International format with country code

// QR Code validation
// Unique nanoid string
```

#### XSS Prevention
- React automatic escaping
- No dangerouslySetInnerHTML usage
- Input sanitization for user content

#### CSRF Protection
- Next.js built-in CSRF protection
- SameSite cookie attribute
- Token validation for state changes

#### API Rate Limiting
- Employs `rate-limiter-flexible` to rate-limit authentication endpoints (`/api/auth/login`, `/api/auth/register`, `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`).
- Limits brute force requests and DDoS vectors in production and local environments.

#### Stealth Mode Authorization
- Admin endpoints (e.g., `/api/admin/users`, `/api/admin/stats`, `/api/admin/items`) leverage a `Stealth Mode` configuration.
- When an unauthorized user attempts to access these endpoints, the server returns a `404 Not Found` response instead of `403 Forbidden` or `401 Unauthorized` to obscure the existence of administrative endpoints.

#### Database Info Exposure Protection
- Health check endpoints (`/api/health`) are cleaned of tech stack details (such as database names like `lost-found-platform`) to avoid information disclosure.

---

## Email System Design

### Email Service Architecture

```
┌─────────────────────────────────────────┐
│         Application Layer                │
│                                          │
│  Email Functions (lib/email.ts)          │
│  - sendVerificationEmail()               │
│  - sendPasswordResetEmail()              │
│  - sendScanNotificationEmail()           │
│                                          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         Resend API Service               │
│                                          │
│  API Endpoint: api.resend.com            │
│  API Key: re_xxxxxxxxxxxxxxx             │
│  From: noreply@lostfoundplatform.me      │
│                                          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         DNS Configuration                │
│                                          │
│  SPF Record: v=spf1 include:_spf...      │
│  DKIM: resend._domainkey                 │
│  DMARC: v=DMARC1; p=quarantine;          │
│                                          │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         User's Email Inbox               │
└─────────────────────────────────────────┘
```

### Email Templates

#### 1. Verification Email
**Subject:** Welcome! Please confirm your email

**Content:**
- Branded header with gradient
- Welcome message
- Verification button (CTA)
- Link fallback (plain text)
- Token expiry notice (24 hours)
- Footer with company info

#### 2. Password Reset Email
**Subject:** Reset Your Password

**Content:**
- Security-themed header (red gradient)
- Reset password button (CTA)
- Link fallback
- Token expiry notice (1 hour)
- Security warning
- Footer

#### 3. Scan Notification Email
**Subject:** Someone Found Your Item!

**Content:**
- Item information box
- Finder contact details box
- GPS location with address
- Action buttons:
  - 📍 View Location (Google Maps)
  - 💬 Contact via WhatsApp
- Message from finder
- Footer

### Email Deliverability Strategy

1. **Domain Authentication**
   - Custom domain (lostfoundplatform.me)
   - SPF, DKIM, DMARC records verified
   - Sender reputation building

2. **Content Optimization**
   - Professional HTML templates
   - Plain text fallback
   - Clear subject lines
   - Reply-to address configured

3. **User Guidance**
   - Spam folder check instructions
   - Add to contacts recommendation
   - Mark as "Not Spam" guidance

---

## Deployment Architecture

### Production Environment

```
┌─────────────────────────────────────────┐
│              DNS Layer                   │
│         (Namecheap)                      │
│                                          │
│  lostfoundplatform.me                    │
│  www.lostfoundplatform.me                │
│         ↓                                │
└─────────┼───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│         CDN & Edge Network               │
│         (Vercel Edge)                    │
│                                          │
│  - SSL/TLS Termination                   │
│  - DDoS Protection                       │
│  - Global CDN                            │
│  - Automatic HTTPS                       │
│         ↓                                │
└─────────┼───────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────┐
│      Application Server                  │
│      (Vercel Serverless)                 │
│                                          │
│  Next.js 15 Application                  │
│  - Server-Side Rendering                 │
│  - API Routes                            │
│  - Static Generation                     │
│         ↓                                │
└─────────┼───────────────────────────────┘
          │
          ├──────────────┬─────────────┐
          ▼              ▼             ▼
┌──────────────┐ ┌────────────┐ ┌─────────────┐
│   MongoDB    │ │  Resend    │ │  External   │
│    Atlas     │ │   Email    │ │  Services   │
│              │ │  - SMTP    │ │ - Geo API   │
│  - Database  │ │  - API     │ │ - Maps      │
│  - Replica   │ └────────────┘ └─────────────┘
│    Set       │
└──────────────┘
```

### Environment Configuration

#### Production (.env.production)
```bash
# Database
MONGODB_URI=mongodb+srv://prod-user:***@prod-cluster.mongodb.net/prod-db

# Authentication
JWT_SECRET=prod-secret-key-64-chars

# Application
NEXT_PUBLIC_APP_URL=https://www.lostfoundplatform.me
NEXT_PUBLIC_QR_BASE_URL=https://www.lostfoundplatform.me/scan
NODE_ENV=production

# Email
RESEND_API_KEY=re_prod_***
FROM_EMAIL=noreply@lostfoundplatform.me
```

#### Development (.env.local)
```bash
# Database
MONGODB_URI=mongodb://localhost:27017/lost-found-dev

# Authentication
JWT_SECRET=dev-secret-key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/scan
NODE_ENV=development

# Email (Dev Override)
RESEND_API_KEY=re_dev_***
FROM_EMAIL=noreply@lostfoundplatform.me
DEV_OVERRIDE_EMAIL=developer@test.com
```

### CI/CD Pipeline

```
┌─────────────────────────────────────────┐
│         GitHub Repository                │
│         (master branch)                  │
└─────────────┬───────────────────────────┘
              │
              │ git push
              ▼
┌─────────────────────────────────────────┐
│         Vercel Integration               │
│                                          │
│  1. Detect Changes                       │
│  2. Install Dependencies                 │
│  3. Build Application                    │
│  4. Run TypeScript Checks                │
│  5. Deploy to Edge Network               │
│  6. Invalidate Cache                     │
│                                          │
└─────────────┬───────────────────────────┘
              │
              │ Deployment Complete
              ▼
┌─────────────────────────────────────────┐
│         Production Site                  │
│    www.lostfoundplatform.me              │
└─────────────────────────────────────────┘
```

### Monitoring & Logging

1. **Application Monitoring**
   - Vercel Analytics
   - Error tracking
   - Performance metrics

2. **Database Monitoring**
   - MongoDB Atlas monitoring
   - Query performance
   - Connection pooling stats

3. **Email Monitoring**
   - Resend dashboard
   - Delivery rates
   - Bounce tracking

---

## Technology Stack

### Frontend Technologies
```
┌─────────────────────────────────────────┐
│  Framework: Next.js 16.2.6               │
│  - App Router                            │
│  - React 19 Server Components            │
│  - TypeScript 5.x                        │
│  - Turbopack (Build Tool)                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Styling: Tailwind CSS v4                │
│  - Utility-first CSS                     │
│  - Custom design system                  │
│  - Responsive design                     │
│  - Shadcn UI (Radix Primitives)          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  UI Components:                          │
│  - react-phone-number-input (3.4.16)     │
│  - Custom components (Navbar, Cropper)   │
│  - react-easy-crop                       │
└─────────────────────────────────────────┘
```

### Backend Technologies
```
┌─────────────────────────────────────────┐
│  Runtime: Node.js 20+                    │
│  API: Next.js API Routes                 │
│  Database: MongoDB Atlas                 │
│  ODM: Mongoose 8.22.x                    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Authentication & Security:              │
│  - jsonwebtoken (9.0.x)                  │
│  - bcryptjs (3.0.x)                      │
│  - rate-limiter-flexible (11.0.x)        │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  External Services:                      │
│  - Resend (6.11.x) - Email service       │
│  - qrcode (1.5.x) - QR generation        │
│  - nanoid (5.1.x) - Unique IDs           │
│  - ably (2.21.x) - Realtime messaging    │
└─────────────────────────────────────────┘
```

### Development & Testing Tools
```
┌─────────────────────────────────────────┐
│  Testing & Code Quality:                 │
│  - Vitest 4.1.x (Unit Testing)           │
│  - ESLint 9.x Flat Config                │
│  - TypeScript strict mode                │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│  Version Control & Deployment:           │
│  - Git & GitHub                          │
│  - Vercel (CI/CD Deployment)             │
└─────────────────────────────────────────┘
```

---

## Future Enhancements

### Phase 1: Performance & Scalability
1. **Image Storage Migration**
   - Move from Base64 to Vercel Blob/Cloudinary
   - Reduce database size
   - Faster image loading
   - Image optimization pipeline

2. **Caching Strategy**
   - Redis for session caching
   - API response caching
   - Static page caching
   - CDN optimization

3. **Database Optimization**
   - Query optimization
   - Index tuning
   - Aggregation pipelines
   - Read replicas

### Phase 2: Advanced Features
1. **Real-time Updates**
   - WebSocket integration
   - Live scan notifications
   - Real-time dashboard updates
   - Online presence indicators

2. **Advanced Analytics**
   - Charts and graphs
   - Export data (CSV/PDF)
   - Custom reports
   - Trend analysis

3. **Mobile Application**
   - React Native app
   - Native QR scanner
   - Push notifications
   - Offline mode

### Phase 3: Ecosystem Expansion
1. **Integrations**
   - Social media sharing
   - Insurance integration
   - Payment gateway (rewards)
   - Third-party APIs

2. **Community Features**
   - User forums
   - Rating system
   - Reward points
   - Leaderboards

3. **Localization**
   - Multi-language support (i18n)
   - Currency conversion
   - Regional customization
   - Local regulations compliance

### Phase 4: Security Enhancements
1. **Advanced Authentication**
   - Two-factor authentication (2FA)
   - Biometric authentication
   - OAuth providers (Google, Facebook)
   - Session management

2. **Data Protection**
   - End-to-end encryption
   - Data backup automation
   - GDPR compliance
   - Privacy controls

3. **Monitoring**
   - Intrusion detection
   - Audit logging
   - Anomaly detection
   - Security alerts

### Phase 5: Business Features
1. **Subscription Model**
   - Premium features
   - Bulk QR codes
   - Priority support
   - Advanced analytics

2. **Enterprise Features**
   - Multi-user accounts
   - Team management
   - Custom branding
   - API access

3. **Marketing Tools**
   - Referral system
   - Affiliate program
   - Email campaigns
   - SEO optimization

---

## Conclusion

The Lost & Found Platform is a comprehensive, production-ready web application built with modern technologies and best practices. The system architecture is scalable, secure, and maintainable, with room for future enhancements.

### Key Achievements
✅ Complete user authentication system with email verification  
✅ QR code-based item tracking  
✅ Anonymous communication between finders and owners  
✅ GPS location tracking with email notifications  
✅ Admin dashboard with comprehensive management tools  
✅ Custom domain with professional email service  
✅ Responsive design for all devices  
✅ Production deployment with CI/CD pipeline

### Success Metrics
- **User Satisfaction:** Anonymous contact system protects privacy
- **Efficiency:** QR code scanning enables instant item lookup
- **Reliability:** 99.9% uptime with Vercel hosting
- **Security:** JWT authentication, bcrypt hashing, email verification
- **Scalability:** Serverless architecture with MongoDB Atlas

---

**Document Version:** 2.0  
**Last Updated:** November 6, 2025  
**Project Status:** Production Ready  
**Live URL:** https://www.lostfoundplatform.me/

**Student Information:**  
- **Name:** ANDYDERIS PUTRA AJI SYABANA  
- **Matric No:** 296530  
- **Programme:** Information Technology  
- **Course:** Final Year Project - STIZK3993  
- **Institution:** UNIVERSITI UTARA MALAYSIA  

**Project ID:** PID154

---

*This document is subject to updates as the project evolves.*

---

## December 2025 Major Updates

### UI/UX & Responsiveness
- Redesigned all pages with modern glassmorphism (blurred, semi-transparent backgrounds, gradient accents)
- Improved color palette: Indigo, Purple, Pink gradients for primary actions; clear status colors for lost/found/inactive
- Fixed all text clipping issues (descenders like g, y, p no longer cut off)
- Navbar is now fully responsive and never overlaps content (dynamic padding applied per device)
- All cards, forms, and tables are mobile-first and scale up to desktop
- Long item names, emails, and scan logs now wrap and never overflow or break layout
- Scan history and item detail cards are fully responsive, with proper word-break and overflow handling
- Button layouts and input fields are optimized for both touch and desktop

### Code & Architecture
- Upgraded to Next.js 15.5.7, React 19, Tailwind CSS v4
- All API endpoints and UI components refactored for strict TypeScript and accessibility
- Improved error handling and user feedback throughout the app
- All forms use strong validation and mobile-friendly input types
- Image uploads are compressed client-side for performance
- QR code generation and download is seamless on all devices
- Admin dashboard, user management, and item management are fully responsive and support large datasets

### Security & Best Practices
- All authentication flows (register, login, reset, verify) are robust and user-friendly
- JWT tokens, password hashing, and email verification enforced
- Role-based access control for admin/user separation
- All user input is sanitized and validated
- Email system (Resend API) is production-grade with custom domain and deliverability best practices

### Known Issues Fixed
- No more navbar overlap on any page (desktop, tablet, mobile)
- No more text clipping on any heading or label
- No more card overflow or scan log cut-off on mobile
- All additional details and custom fields are mobile-friendly
- All error messages are clear and actionable

### Project Status
- **Production Ready** as of June 2026
- All major bugs and UI/UX issues resolved
- Fully responsive, secure, tested, and scalable
- See full documentation above for architecture, API, and future roadmap

---

## June 2026 Major Updates

### UI/UX & Responsiveness
- **Enhanced Filter Management:** Added sorting options (Newest, Oldest, Alphabetical) and time frames (Today, Past Week, Past Month) for dashboard and admin items interfaces.
- **Search Capabilities:** Integrated search query bars for dynamic frontend search filtering.
- **Responsive Padding & Margins:** Cleaned up spacing and layout structure for all filter controls across mobile, tablet, and desktop devices.
- **Completed Frontend Redesign:** All 18 UI screens are now fully migrated and redesigned using modern Tailwind CSS v4 and Shadcn UI components.

### Security Hardening
- **Stealth Mode Authorization:** Enforced stealth mode for unauthorized requests attempting to access admin endpoints, returning `404 Not Found` instead of revealing the admin paths' existence.
- **API Rate Limiting:** Integrated `rate-limiter-flexible` across authentication/credentials flows (`/api/auth/register`, `/api/auth/login`, `/api/auth/verify-email`, `/api/auth/forgot-password`, `/api/auth/reset-password`).
- **Health Check Credentials Exposure Fixed:** Removed database naming and operational backend details from `/api/health` to prevent system information disclosure.

### Quality Assurance & Testing
- **Vitest Integration:** Added Vitest framework along with JSDOM and React Testing Library setup for fast, local unit testing.
- **Unit Testing Coverage:** Added unit test coverage for registration API handlers (`src/app/api/auth/register/route.test.ts`) and security validators.
- **ESLint Flat Config:** Migrated from ESLint 8 legacy config to ESLint 9 Flat Config (`eslint.config.mjs`) to ensure modern code linting standards and seamless builds.

---
