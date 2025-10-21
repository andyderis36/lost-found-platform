# Lost & Found Platform - Project Design Document

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [System Requirements](#2-system-requirements)
3. [System Architecture](#3-system-architecture)
4. [Database Design](#4-database-design)
5. [API Design](#5-api-design)
6. [User Interface Design](#6-user-interface-design)
7. [Security Design](#7-security-design)
8. [Technology Stack](#8-technology-stack)
9. [Deployment Architecture](#9-deployment-architecture)

---

## 1. Project Overview

### 1.1 Project Title
**Lost & Found Platform with QR Code Tags (PID154)**

### 1.2 Problem Statement
People frequently lose valuable items in public spaces, and current lost & found systems are inefficient:
- No standardized way to identify lost items
- Difficult to contact owners when items are found
- Manual, time-consuming processes
- Limited tracking of item history

### 1.3 Proposed Solution
A web-based platform that:
- Generates unique QR codes for registered items
- Allows finders to scan QR codes to contact owners
- Tracks scan history with location data
- Provides centralized item management dashboard

### 1.4 Project Objectives
- ✅ Enable users to register items with unique QR codes
- ✅ Allow anonymous scanning to contact item owners
- ✅ Track scan history with GPS location
- ✅ Provide secure authentication and authorization
- ✅ Support image uploads for item identification
- ✅ Deploy scalable cloud-based solution

### 1.5 Target Users
1. **Item Owners**: Register and manage their valuable items
2. **Finders**: Scan QR codes to report found items
3. **General Public**: Anyone who finds a lost item

---

## 2. System Requirements

### 2.1 Functional Requirements

#### FR1: User Management
- **FR1.1**: Users can register with email, name, password, and phone number
- **FR1.2**: Users can login with email and password
- **FR1.3**: System validates email format and password strength (min 6 characters)
- **FR1.4**: Authenticated users can view their profile

#### FR2: Item Management
- **FR2.1**: Users can register new items with name, category, description, and optional image
- **FR2.2**: System auto-generates unique QR code for each item (format: LF-XXXXXXXXXX)
- **FR2.3**: Users can view all their registered items
- **FR2.4**: Users can update item status (active, found, inactive)
- **FR2.5**: Users can delete registered items
- **FR2.6**: Users can download QR code as PNG image
- **FR2.7**: System supports 8 categories: Electronics, Personal Items, Bags & Luggage, Jewelry, Documents, Keys, Sports Equipment, Other

#### FR3: QR Code Scanning
- **FR3.1**: Anyone can scan QR code without authentication
- **FR3.2**: Scan page displays item details (name, category, description, image, status)
- **FR3.3**: Finders can submit contact form with name, email, phone, and message
- **FR3.4**: System captures GPS location during scan (with user permission)
- **FR3.5**: System logs scan events with timestamp

#### FR4: Scan History
- **FR4.1**: Item owners can view scan history for each item
- **FR4.2**: Scan history shows scanner name, contact info, location, message, and timestamp
- **FR4.3**: Location displayed as clickable Google Maps link

#### FR5: Dashboard & Analytics
- **FR5.1**: Dashboard shows total items count
- **FR5.2**: Dashboard displays items by status (active, found, inactive)
- **FR5.3**: Users can filter items by status
- **FR5.4**: Items display with image or QR code preview

### 2.2 Non-Functional Requirements

#### NFR1: Security
- **NFR1.1**: Passwords hashed using bcrypt (10 salt rounds)
- **NFR1.2**: JWT tokens for authentication (7-day expiry)
- **NFR1.3**: Protected routes require valid JWT token
- **NFR1.4**: Public scan endpoint accessible without authentication

#### NFR2: Performance
- **NFR2.1**: Page load time < 3 seconds
- **NFR2.2**: API response time < 500ms
- **NFR2.3**: QR code generation < 1 second
- **NFR2.4**: Support concurrent users (serverless auto-scaling)

#### NFR3: Usability
- **NFR3.1**: Responsive design (mobile, tablet, desktop)
- **NFR3.2**: Intuitive navigation with breadcrumbs
- **NFR3.3**: Clear error messages and validation feedback
- **NFR3.4**: Loading states for async operations

#### NFR4: Reliability
- **NFR4.1**: 99.9% uptime (Vercel SLA)
- **NFR4.2**: Automated deployments from GitHub
- **NFR4.3**: Database backups (MongoDB Atlas)

#### NFR5: Scalability
- **NFR5.1**: Serverless architecture (auto-scaling)
- **NFR5.2**: CDN for static assets (Vercel Edge Network)
- **NFR5.3**: Database connection pooling

---

## 3. System Architecture

### 3.1 Architecture Pattern
**Three-Tier Architecture with Serverless Backend**

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js Frontend (React 19 + TypeScript)           │   │
│  │   - Pages: Home, Login, Register, Dashboard, etc.    │   │
│  │   - Components: Navbar, AuthContext                   │   │
│  │   - Client-side routing & state management            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   Next.js API Routes (Serverless Functions)          │   │
│  │   - /api/auth: Authentication endpoints              │   │
│  │   - /api/items: Item CRUD operations                 │   │
│  │   - /api/scans: Scan logging                         │   │
│  │   - Middleware: JWT validation, error handling       │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕ MongoDB Driver
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌──────────────────────────────────────────────────────┐   │
│  │   MongoDB Atlas (Cloud Database)                     │   │
│  │   - Collections: users, items, scans                 │   │
│  │   - Indexes: email, qrCode, userId                   │   │
│  │   - Schemas: Mongoose models with validation         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                        FRONTEND COMPONENTS                    │
├──────────────────────────────────────────────────────────────┤
│  Pages:                    Components:                        │
│  • page.tsx (Home)         • Navbar                           │
│  • login/page.tsx          • AuthContext (Global State)       │
│  • register/page.tsx                                          │
│  • dashboard/page.tsx                                         │
│  • items/new/page.tsx                                         │
│  • items/[id]/page.tsx                                        │
│  • scan/[qrCode]/page.tsx                                     │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                         API ROUTES                            │
├──────────────────────────────────────────────────────────────┤
│  Authentication:           Items:                             │
│  • POST /api/auth/register • POST /api/items                  │
│  • POST /api/auth/login    • GET /api/items                   │
│  • GET /api/auth/me        • GET /api/items/[id]              │
│                            • PUT /api/items/[id]              │
│  Scans:                    • DELETE /api/items/[id]           │
│  • POST /api/scans         • GET /api/items/[id]/qr           │
│  • GET /api/scans/[itemId] • GET /api/items/public/[qrCode]   │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                      UTILITY LIBRARIES                        │
├──────────────────────────────────────────────────────────────┤
│  • lib/mongodb.ts - Database connection                       │
│  • lib/auth.ts - Password hashing, JWT, validation            │
│  • lib/qrcode.ts - QR code generation                         │
│  • lib/api.ts - API helpers (responses, error handling)       │
└──────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────┐
│                       DATA MODELS                             │
├──────────────────────────────────────────────────────────────┤
│  • models/User.ts - User schema & validation                  │
│  • models/Item.ts - Item schema & validation                  │
│  • models/Scan.ts - Scan schema & validation                  │
└──────────────────────────────────────────────────────────────┘
```

### 3.3 Data Flow Diagrams

#### DFD Level 0 (Context Diagram)
```
                    ┌──────────────┐
                    │ Item Owner   │
                    └──────┬───────┘
                           │
                           ↓
        ┌─────────────────────────────────────┐
        │                                     │
        │   Lost & Found Platform             │
        │   - Register Items                  │
        │   - Generate QR Codes               │
        │   - Track Scans                     │
        │                                     │
        └─────────────────────────────────────┘
                           ↑
                           │
                    ┌──────┴───────┐
                    │ Finder       │
                    └──────────────┘
```

#### DFD Level 1 (Item Registration Flow)
```
┌────────┐     Register Item    ┌──────────────┐
│  User  │ ──────────────────→  │   Validate   │
└────────┘                       │   Item Data  │
                                 └──────┬───────┘
                                        │
                                        ↓
                                 ┌──────────────┐
                                 │   Generate   │
                                 │   QR Code    │
                                 └──────┬───────┘
                                        │
                                        ↓
                                 ┌──────────────┐      Store
                                 │  Save to DB  │ ────────→ [Items]
                                 └──────┬───────┘
                                        │
                                        ↓
                                 ┌──────────────┐
                                 │  Return Item │
                                 │  + QR Image  │
                                 └──────────────┘
```

#### DFD Level 1 (Scan Flow)
```
┌────────┐     Scan QR Code     ┌──────────────┐
│ Finder │ ──────────────────→  │  Fetch Item  │ ←──── [Items DB]
└────────┘                       │  by QR Code  │
     │                           └──────┬───────┘
     │                                  │
     │ Submit Contact                   ↓
     │ Info + Location           ┌──────────────┐
     └─────────────────────────→ │   Log Scan   │
                                 │   + Location │
                                 └──────┬───────┘
                                        │
                                        ↓
                                   [Scans DB] ───→ Notify Owner
```

---

## 4. Database Design

### 4.1 Entity-Relationship Diagram (ERD)

```
┌─────────────────────────────────────────────────────────────────┐
│                              USERS                              │
├─────────────────────────────────────────────────────────────────┤
│ PK  _id: ObjectId                                               │
│     email: String (unique, indexed)                             │
│     name: String                                                │
│     password: String (hashed)                                   │
│     phone: String                                               │
│     createdAt: Date                                             │
│     updatedAt: Date                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                              ITEMS                              │
├─────────────────────────────────────────────────────────────────┤
│ PK  _id: ObjectId                                               │
│ FK  userId: ObjectId → Users._id (indexed)                      │
│     qrCode: String (unique, indexed)                            │
│     name: String                                                │
│     category: String (enum)                                     │
│     description: String                                         │
│     image: String (base64)                                      │
│     customFields: Object                                        │
│     status: String (enum: active, lost, found, inactive)        │
│     createdAt: Date                                             │
│     updatedAt: Date                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                              SCANS                              │
├─────────────────────────────────────────────────────────────────┤
│ PK  _id: ObjectId                                               │
│ FK  itemId: ObjectId → Items._id (indexed)                      │
│     qrCode: String (indexed)                                    │
│     scannerName: String                                         │
│     scannerEmail: String                                        │
│     scannerPhone: String                                        │
│     location: {                                                 │
│       latitude: Number                                          │
│       longitude: Number                                         │
│       address: String                                           │
│     }                                                            │
│     message: String                                             │
│     scannedAt: Date (indexed)                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Collection Schemas

#### Users Collection
```javascript
{
  _id: ObjectId,
  email: "user@example.com",        // Unique, indexed
  name: "John Doe",
  password: "$2b$10$...",            // Bcrypt hashed
  phone: "+1234567890",
  createdAt: ISODate("2025-10-20"),
  updatedAt: ISODate("2025-10-20")
}

Indexes:
- { email: 1 } (unique)
- { createdAt: -1 }

Validation:
- email: regex pattern, unique
- name: 2-100 chars
- password: hashed, min 60 chars
- phone: 10-15 chars
```

#### Items Collection
```javascript
{
  _id: ObjectId,
  userId: ObjectId("..."),           // References users._id, indexed
  qrCode: "LF-abc123xyz",            // Unique, indexed
  name: "iPhone 15 Pro",
  category: "Electronics",           // Enum
  description: "Black, 256GB",
  image: "data:image/png;base64...", // Base64 string
  customFields: {
    "Serial Number": "ABC123",
    "Color": "Black"
  },
  status: "active",                  // Enum: active, lost, found, inactive
  createdAt: ISODate("2025-10-20"),
  updatedAt: ISODate("2025-10-20")
}

Indexes:
- { qrCode: 1 } (unique)
- { userId: 1, createdAt: -1 }
- { status: 1 }

Validation:
- name: 2-100 chars, required
- category: enum, required
- description: max 500 chars
- status: enum (active, lost, found, inactive)
```

#### Scans Collection
```javascript
{
  _id: ObjectId,
  itemId: ObjectId("..."),           // References items._id, indexed
  qrCode: "LF-abc123xyz",            // Indexed
  scannerName: "Jane Smith",
  scannerEmail: "jane@example.com",
  scannerPhone: "+1234567890",
  location: {
    latitude: -6.2088,
    longitude: 106.8456,
    address: "Jakarta, Indonesia"    // Optional
  },
  message: "Found at Starbucks",
  scannedAt: ISODate("2025-10-20")   // Indexed
}

Indexes:
- { itemId: 1, scannedAt: -1 }
- { qrCode: 1, scannedAt: -1 }
- { scannedAt: -1 }

Validation:
- scannerName: 2-100 chars, required
- scannerEmail: valid email format
- scannerPhone: 10-15 chars
- location: optional
- message: max 500 chars
```

### 4.3 Database Relationships

- **One-to-Many**: User → Items (one user owns many items)
- **One-to-Many**: Item → Scans (one item has many scan records)

### 4.4 Indexing Strategy

```javascript
// Users
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ createdAt: -1 })

// Items
db.items.createIndex({ qrCode: 1 }, { unique: true })
db.items.createIndex({ userId: 1, createdAt: -1 })
db.items.createIndex({ status: 1 })

// Scans
db.scans.createIndex({ itemId: 1, scannedAt: -1 })
db.scans.createIndex({ qrCode: 1, scannedAt: -1 })
db.scans.createIndex({ scannedAt: -1 })
```

---

## 5. API Design

### 5.1 API Architecture
- **RESTful API** design principles
- **JSON** request/response format
- **JWT Bearer Token** authentication
- **Consistent response structure**

### 5.2 Response Format Standard

#### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

#### Error Response
```json
{
  "success": false,
  "error": "Error message description"
}
```

### 5.3 API Endpoints

#### Authentication Endpoints

**POST /api/auth/register**
```
Description: Register new user account
Authentication: None (public)
Request Body:
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123",
  "phone": "+1234567890"
}

Success Response (201):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Registration successful"
}

Error Responses:
- 400: Email already exists
- 400: Invalid email format
- 400: Password too short (min 6 chars)
- 400: Missing required fields
```

**POST /api/auth/login**
```
Description: User login
Authentication: None (public)
Request Body:
{
  "email": "user@example.com",
  "password": "password123"
}

Success Response (200):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}

Error Responses:
- 401: Invalid credentials
- 400: Missing email or password
```

**GET /api/auth/me**
```
Description: Get authenticated user profile
Authentication: Required (JWT)
Headers:
  Authorization: Bearer <token>

Success Response (200):
{
  "success": true,
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890"
  }
}

Error Responses:
- 401: Unauthorized (missing/invalid token)
```

#### Item Management Endpoints

**POST /api/items**
```
Description: Create new item with QR code
Authentication: Required (JWT)
Request Body:
{
  "name": "iPhone 15 Pro",
  "category": "Electronics",
  "description": "Black, 256GB",
  "image": "data:image/png;base64...",
  "customFields": {
    "Serial": "ABC123"
  }
}

Success Response (201):
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "qrCode": "LF-abc123xyz",
    "name": "iPhone 15 Pro",
    "category": "Electronics",
    "description": "Black, 256GB",
    "image": "data:image/png;base64...",
    "status": "active",
    "qrCodeDataUrl": "data:image/png;base64...",
    "createdAt": "2025-10-20T12:00:00.000Z",
    "updatedAt": "2025-10-20T12:00:00.000Z"
  },
  "message": "Item created successfully"
}

Error Responses:
- 401: Unauthorized
- 400: Invalid category
- 400: Missing name or category
```

**GET /api/items**
```
Description: List all items for authenticated user
Authentication: Required (JWT)
Query Parameters:
  ?status=active (optional: active, found, inactive)
  ?category=Electronics (optional)

Success Response (200):
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "507f1f77bcf86cd799439011",
        "qrCode": "LF-abc123xyz",
        "name": "iPhone 15 Pro",
        "category": "Electronics",
        "description": "Black, 256GB",
        "image": "data:image/png;base64...",
        "status": "active",
        "createdAt": "2025-10-20T12:00:00.000Z",
        "updatedAt": "2025-10-20T12:00:00.000Z"
      }
    ],
    "total": 1
  }
}

Error Responses:
- 401: Unauthorized
```

**GET /api/items/[id]**
```
Description: Get single item details
Authentication: Required (JWT, must be owner)
Path Parameters:
  id: Item ObjectId

Success Response (200):
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "qrCode": "LF-abc123xyz",
    "name": "iPhone 15 Pro",
    "category": "Electronics",
    "description": "Black, 256GB",
    "image": "data:image/png;base64...",
    "customFields": { "Serial": "ABC123" },
    "status": "active",
    "qrCodeDataUrl": "data:image/png;base64...",
    "createdAt": "2025-10-20T12:00:00.000Z",
    "updatedAt": "2025-10-20T12:00:00.000Z"
  }
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden (not owner)
- 404: Item not found
- 400: Invalid item ID
```

**PUT /api/items/[id]**
```
Description: Update item details
Authentication: Required (JWT, must be owner)
Request Body:
{
  "name": "iPhone 15 Pro Max",
  "description": "Updated description",
  "status": "found"
}

Success Response (200):
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro Max",
    "status": "found",
    ...
  },
  "message": "Item updated successfully"
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden
- 404: Item not found
- 400: Invalid status
```

**DELETE /api/items/[id]**
```
Description: Delete item (also deletes associated scans)
Authentication: Required (JWT, must be owner)

Success Response (200):
{
  "success": true,
  "message": "Item deleted successfully"
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden
- 404: Item not found
```

**GET /api/items/[id]/qr**
```
Description: Download QR code as PNG image
Authentication: Required (JWT, must be owner)

Success Response (200):
  Content-Type: image/png
  Binary PNG data

Error Responses:
- 401: Unauthorized
- 403: Forbidden
- 404: Item not found
```

**GET /api/items/public/[qrCode]**
```
Description: Get item details by QR code (public, no auth)
Authentication: None (public)
Path Parameters:
  qrCode: QR code string (e.g., LF-abc123xyz)

Success Response (200):
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "iPhone 15 Pro",
    "category": "Electronics",
    "description": "Black, 256GB",
    "image": "data:image/png;base64...",
    "status": "active"
  }
}

Error Responses:
- 404: Item not found
- 400: Invalid QR code
```

#### Scan Logging Endpoints

**POST /api/scans**
```
Description: Log scan event (public, no auth)
Authentication: None (public)
Request Body:
{
  "qrCode": "LF-abc123xyz",
  "scannerName": "Jane Smith",
  "scannerEmail": "jane@example.com",
  "scannerPhone": "+1234567890",
  "location": {
    "latitude": -6.2088,
    "longitude": 106.8456
  },
  "message": "Found at Starbucks"
}

Success Response (201):
{
  "success": true,
  "data": {
    "scanId": "507f1f77bcf86cd799439012",
    "itemName": "iPhone 15 Pro",
    "scannedAt": "2025-10-20T12:00:00.000Z"
  },
  "message": "Scan logged successfully"
}

Error Responses:
- 404: Item not found with this QR code
- 400: Missing required fields (qrCode, scannerName)
```

**GET /api/scans/[itemId]**
```
Description: Get scan history for an item
Authentication: Required (JWT, must be item owner)
Path Parameters:
  itemId: Item ObjectId

Success Response (200):
{
  "success": true,
  "data": {
    "item": {
      "id": "507f1f77bcf86cd799439011",
      "name": "iPhone 15 Pro",
      "qrCode": "LF-abc123xyz",
      "status": "active"
    },
    "scans": [
      {
        "id": "507f1f77bcf86cd799439012",
        "scannerName": "Jane Smith",
        "scannerEmail": "jane@example.com",
        "scannerPhone": "+1234567890",
        "location": {
          "latitude": -6.2088,
          "longitude": 106.8456,
          "address": null
        },
        "message": "Found at Starbucks",
        "scannedAt": "2025-10-20T12:00:00.000Z"
      }
    ],
    "total": 1
  }
}

Error Responses:
- 401: Unauthorized
- 403: Forbidden (not item owner)
- 404: Item not found
```

### 5.4 Authentication Flow

```
┌────────┐                           ┌──────────┐
│ Client │                           │  Server  │
└───┬────┘                           └────┬─────┘
    │                                     │
    │ POST /api/auth/login                │
    │ { email, password }                 │
    │─────────────────────────────────────>│
    │                                     │
    │                      Validate credentials
    │                      Hash password & compare
    │                      Generate JWT token
    │                                     │
    │ { success: true, data: { token } } │
    │<─────────────────────────────────────│
    │                                     │
    │ Store token in localStorage         │
    │                                     │
    │ GET /api/items                      │
    │ Authorization: Bearer <token>       │
    │─────────────────────────────────────>│
    │                                     │
    │                      Verify JWT token
    │                      Decode userId
    │                      Fetch user items
    │                                     │
    │ { success: true, data: { items } } │
    │<─────────────────────────────────────│
```

---

## 6. User Interface Design

### 6.1 Design Principles
- **Responsive**: Mobile-first design using Tailwind CSS
- **Clean**: Minimalist UI with clear visual hierarchy
- **Accessible**: WCAG 2.1 AA compliance
- **Consistent**: Uniform color scheme, typography, spacing

### 6.2 Color Palette
```
Primary: Blue
  - #2563EB (blue-600) - Primary actions, links
  - #1D4ED8 (blue-700) - Hover states

Secondary: Gray
  - #1F2937 (gray-800) - Headers, important text
  - #4B5563 (gray-600) - Body text
  - #9CA3AF (gray-400) - Placeholder text
  - #F3F4F6 (gray-50) - Background

Status Colors:
  - #10B981 (green-500) - Active status, success
  - #EF4444 (red-500) - Error, lost status
  - #8B5CF6 (purple-500) - Found status
  - #6B7280 (gray-500) - Inactive status
```

### 6.3 Typography
```
Font Family: System fonts (-apple-system, BlinkMacSystemFont, Segoe UI, etc.)

Headings:
  - H1: 2.25rem (36px), font-bold
  - H2: 1.5rem (24px), font-bold
  - H3: 1.25rem (20px), font-semibold

Body:
  - Default: 1rem (16px), font-normal
  - Small: 0.875rem (14px)
  - Tiny: 0.75rem (12px)
```

### 6.4 Page Wireframes

#### Homepage
```
┌─────────────────────────────────────────────────────┐
│ Navbar: [Logo] [Home] [Features] [Login] [Register]│
├─────────────────────────────────────────────────────┤
│                                                     │
│              🏷️ Lost & Found Platform              │
│         Never lose your valuables again             │
│                                                     │
│    [Get Started →]  [Learn More]                   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  Features:                                          │
│  📱 QR Code Tags  |  🔍 Easy Scanning  | 📍 GPS    │
│  Generate unique  |  Anyone can scan   | Track      │
│  codes for items  |  to contact you    | locations  │
└─────────────────────────────────────────────────────┘
```

#### Dashboard
```
┌─────────────────────────────────────────────────────┐
│ Navbar: [Lost&Found] [Dashboard] [👤 User ▼]       │
├─────────────────────────────────────────────────────┤
│ Dashboard                        [+ Add New Item]   │
│                                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│ │  Total  │ │ Active  │ │  Found  │ │Inactive │  │
│ │    5    │ │    3    │ │    1    │ │    1    │  │
│ └─────────┘ └─────────┘ └─────────┘ └─────────┘  │
│                                                     │
│ Filter: [All ▼] [Active] [Found] [Inactive]        │
│                                                     │
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────┐│
│ │ [QR/Photo]   │ │ [QR/Photo]   │ │ [QR/Photo]  ││
│ │              │ │              │ │             ││
│ │ iPhone 15    │ │ Wallet       │ │ MacBook     ││
│ │ Electronics  │ │ Personal     │ │ Electronics ││
│ │ ● Active     │ │ ● Found      │ │ ● Active    ││
│ │              │ │              │ │             ││
│ │ [View] [Del] │ │ [View] [Del] │ │ [View][Del] ││
│ └───────────────┘ └───────────────┘ └─────────────┘│
└─────────────────────────────────────────────────────┘
```

#### Add New Item
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                 │
│                                                     │
│ Register New Item                                   │
│ Add your item details. A QR code will be generated.│
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Item Name *                                     ││
│ │ [_______________________________________]       ││
│ │                                                 ││
│ │ Category *                                      ││
│ │ [Electronics ▼]                                 ││
│ │                                                 ││
│ │ Description *                                   ││
│ │ [_______________________________________]       ││
│ │ [_______________________________________]       ││
│ │                                                 ││
│ │ Item Photo (Optional)                           ││
│ │ [Choose File]  [Preview]                        ││
│ │                                                 ││
│ │ Custom Fields (Optional)                        ││
│ │ [Key] [Value] [+ Add]                           ││
│ │                                                 ││
│ │         [Create Item]                           ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### Item Detail Page
```
┌─────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                 │
├─────────────────────────────────────────────────────┤
│ ┌──────────────┐  iPhone 15 Pro     ● Active       │
│ │              │  Electronics                       │
│ │  [QR Code]   │  Created: Oct 20, 2025             │
│ │   Image      │                                    │
│ │              │  [Download QR] [Edit] [Delete]     │
│ └──────────────┘                                    │
│                                                     │
│ ┌─────────────────────────────────────────────────┐│
│ │ Description                                     ││
│ │ Black, 256GB, latest model                      ││
│ │                                                 ││
│ │ Image                                           ││
│ │ [Photo preview]                                 ││
│ │                                                 ││
│ │ Additional Details                              ││
│ │ Serial Number: ABC123                           ││
│ └─────────────────────────────────────────────────┘│
│                                                     │
│ Scan History (2)                                    │
│ ┌─────────────────────────────────────────────────┐│
│ │ John Doe               Oct 20, 05:34 PM         ││
│ │ john@example.com                                ││
│ │ +1234567890                                     ││
│ │ Location: 📍 [Google Maps Link]                 ││
│ │ Message: Found at Starbucks                     ││
│ └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

#### Scan Page (Public)
```
┌─────────────────────────────────────────────────────┐
│                [Item Photo]                         │
│                                                     │
│             iPhone 15 Pro    🔴 LOST                │
│             📦 Electronics                          │
│                                                     │
│ Black, 256GB, latest model                          │
│                                                     │
│ ⚠️ This item has been reported as LOST              │
│ If you found this item, please fill the form below.│
│                                                     │
├─────────────────────────────────────────────────────┤
│ Contact Owner                                       │
│ Found this item? Fill in your details.              │
│                                                     │
│ Your Name *                                         │
│ [_____________________________________________]     │
│                                                     │
│ Email                                               │
│ [_____________________________________________]     │
│                                                     │
│ Phone Number                                        │
│ [_____________________________________________]     │
│                                                     │
│ Message (Optional)                                  │
│ [_____________________________________________]     │
│ [_____________________________________________]     │
│                                                     │
│ 📍 Location Sharing: We'll ask permission to share │
│    your location when you submit.                  │
│                                                     │
│              [Contact Owner]                        │
│                                                     │
│ Your info will be shared with the owner.            │
└─────────────────────────────────────────────────────┘
```

### 6.5 Navigation Flow
```
                  [Homepage]
                      │
        ┌─────────────┼─────────────┐
        │                           │
    [Login]                    [Register]
        │                           │
        └─────────────┬─────────────┘
                      │
                 [Dashboard]
                      │
        ┌─────────────┼─────────────┐
        │             │             │
   [Add Item]  [Item Detail]  [Profile]
                      │
                [Scan History]


Public Flow:
[Scan QR Code] → [Scan Page] → [Submit Contact] → [Success]
```

---

## 7. Security Design

### 7.1 Authentication & Authorization

#### Password Security
```javascript
// Hashing: bcrypt with 10 salt rounds
const hashedPassword = await bcrypt.hash(password, 10);

// Validation
- Minimum length: 6 characters
- Stored as hash (never plaintext)
- Not logged or exposed in responses
```

#### JWT Token
```javascript
// Token structure
{
  "userId": "507f1f77bcf86cd799439011",
  "email": "user@example.com",
  "iat": 1697817600,    // Issued at
  "exp": 1698422400     // Expires in 7 days
}

// Token usage
- Signed with JWT_SECRET (64-char random string)
- Sent in Authorization header: "Bearer <token>"
- Validated on every protected route
- Stored in localStorage on client
```

### 7.2 API Security

#### Route Protection
```
Public Routes (no auth):
- POST /api/auth/register
- POST /api/auth/login
- GET /api/items/public/[qrCode]
- POST /api/scans
- GET /api/health

Protected Routes (JWT required):
- GET /api/auth/me
- POST /api/items
- GET /api/items
- GET /api/items/[id]
- PUT /api/items/[id]
- DELETE /api/items/[id]
- GET /api/items/[id]/qr
- GET /api/scans/[itemId]
```

#### Authorization Checks
```javascript
// Ownership verification
const item = await Item.findById(id);
if (item.userId.toString() !== authUser.userId) {
  return 403 Forbidden
}
```

### 7.3 Input Validation

#### Server-Side Validation
```javascript
// Email format
const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password strength
- Minimum 6 characters
- No maximum (to allow passphrases)

// String sanitization
- Trim whitespace
- Maxlength limits
- Type coercion prevention

// Category enum
validCategories = ['Electronics', 'Personal Items', ...]
if (!validCategories.includes(category)) throw error
```

#### Client-Side Validation
```javascript
// Form validation before submission
- Required fields check
- Email format validation
- Real-time feedback
- Prevent empty submissions
```

### 7.4 Data Protection

#### Sensitive Data Handling
```
Encrypted:
- Passwords (bcrypt)
- JWT tokens (signed)

Not Logged:
- Passwords
- JWT secrets
- Sensitive user data

Protected:
- Environment variables (.env.local not in git)
- API keys (stored in Vercel env vars)
```

#### Database Security
```
MongoDB Atlas Security:
- Network access whitelist (0.0.0.0/0 or specific IPs)
- Database authentication (username/password)
- Connection string in environment variables
- TLS/SSL encryption in transit
- Automatic backups
```

### 7.5 CORS & Headers

```javascript
// Next.js default CORS (same-origin)
// Custom headers for security
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block"
}
```

### 7.6 Security Best Practices

```
✅ Environment variables for secrets
✅ HTTPS in production (Vercel automatic)
✅ JWT token expiration (7 days)
✅ Password hashing (bcrypt)
✅ Input validation (client & server)
✅ SQL injection prevention (Mongoose ODM)
✅ XSS prevention (React auto-escapes)
✅ CSRF protection (SameSite cookies)
✅ Rate limiting (Vercel automatic)
✅ Error handling (no stack traces in production)
```

---

## 8. Technology Stack

### 8.1 Frontend
```
Framework: Next.js 15.5.6
  - React 19
  - App Router (file-based routing)
  - Server Components + Client Components
  - Turbopack (fast bundler)

Language: TypeScript 5
  - Type safety
  - IntelliSense support
  - Compile-time error checking

Styling: Tailwind CSS 3
  - Utility-first CSS
  - Responsive design
  - Custom color palette
  - JIT compiler

State Management:
  - React Context API (AuthContext)
  - useState, useEffect hooks
  - localStorage for token persistence

Form Handling:
  - Controlled components
  - Custom validation
  - Real-time feedback
```

### 8.2 Backend
```
Runtime: Node.js 20+
Framework: Next.js API Routes (Serverless)

Libraries:
  - bcryptjs: Password hashing
  - jsonwebtoken: JWT authentication
  - mongoose: MongoDB ODM
  - qrcode: QR code generation
  - nanoid: Unique ID generation

Database: MongoDB 7.0
  - Atlas (cloud hosting)
  - Mongoose schemas
  - Indexes for performance
```

### 8.3 Development Tools
```
Package Manager: npm
Version Control: Git + GitHub
Code Editor: VS Code
  - ESLint: Code linting
  - Prettier: Code formatting
  - TypeScript: Type checking

Environment:
  - .env.local for secrets
  - .env.example for documentation
```

### 8.4 Deployment
```
Hosting: Vercel
  - Serverless deployment
  - Automatic HTTPS
  - CDN (Edge Network)
  - Auto-scaling
  - GitHub integration (CI/CD)
  - Environment variables management

Database: MongoDB Atlas
  - Cloud database
  - Automatic backups
  - M0 Free Tier (512MB)
  - Global clusters
```

### 8.5 Third-Party Services
```
QR Code Generation: qrcode library
  - PNG format
  - Base64 data URLs
  - Customizable size & colors

Geolocation: Browser Geolocation API
  - GPS coordinates
  - User permission-based
  - Optional fallback

Maps Integration: Google Maps
  - Link generation for coordinates
  - Opens in new tab
```

---

## 9. Deployment Architecture

### 9.1 Production Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (Browser)                      │
│  - React Frontend                                        │
│  - localStorage (JWT token)                              │
│  - Service Worker (PWA ready)                            │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS
                        ↓
┌─────────────────────────────────────────────────────────┐
│                  VERCEL EDGE NETWORK                     │
│  - CDN (Global distribution)                             │
│  - SSL/TLS Termination                                   │
│  - DDoS Protection                                       │
│  - Automatic HTTPS                                       │
└───────────────────────┬─────────────────────────────────┘
                        │
        ┌───────────────┴───────────────┐
        │                               │
        ↓                               ↓
┌──────────────────┐          ┌──────────────────┐
│ Static Assets    │          │ Next.js Server   │
│ - HTML, CSS, JS  │          │ - API Routes     │
│ - Images         │          │ - SSR Pages      │
│ - Fonts          │          │ - Serverless     │
└──────────────────┘          └────────┬─────────┘
                                       │
                                       ↓
                           ┌─────────────────────┐
                           │  MongoDB Atlas      │
                           │  - Users            │
                           │  - Items            │
                           │  - Scans            │
                           │  - Replica Set      │
                           │  - Auto Backups     │
                           └─────────────────────┘
```

### 9.2 Deployment Process

```
┌──────────────┐
│ Developer    │
│ Local Dev    │
└──────┬───────┘
       │ git push
       ↓
┌──────────────┐
│ GitHub Repo  │
│ master branch│
└──────┬───────┘
       │ webhook
       ↓
┌──────────────────────────────────────┐
│ Vercel CI/CD Pipeline                │
│ 1. Pull latest code                  │
│ 2. Install dependencies (npm)        │
│ 3. Run build (next build)            │
│ 4. Type checking (tsc)               │
│ 5. Linting (eslint)                  │
│ 6. Deploy to Edge Network            │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────┐
│ Production   │
│ https://...  │
│ .vercel.app  │
└──────────────┘
```

### 9.3 Environment Configuration

#### Development (.env.local)
```bash
MONGODB_URI=mongodb://localhost:27017/lost-found-platform
JWT_SECRET=dev-secret-key-change-in-production
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/scan
```

#### Production (Vercel Environment Variables)
```bash
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db
JWT_SECRET=<64-char-random-string>
NEXT_PUBLIC_APP_URL=https://lost-found-platform-virid.vercel.app
NEXT_PUBLIC_QR_BASE_URL=https://lost-found-platform-virid.vercel.app/scan
```

### 9.4 Scalability Strategy

```
Horizontal Scaling:
✅ Serverless functions (auto-scale)
✅ CDN for static assets (global distribution)
✅ MongoDB Atlas auto-scaling (M0 → M10 → M20)

Vertical Scaling:
✅ Upgrade Vercel plan (more bandwidth, builds)
✅ Upgrade MongoDB cluster (more storage, RAM)

Performance Optimization:
✅ Next.js Image Optimization
✅ Code splitting (automatic)
✅ Tree shaking (remove unused code)
✅ Minification (CSS, JS)
✅ Gzip compression
✅ Database indexing
```

### 9.5 Monitoring & Logging

```
Vercel Analytics:
- Page views
- Geographic distribution
- Device types
- Performance metrics (Web Vitals)

Vercel Logs:
- Function execution logs
- Error tracking
- API response times

MongoDB Atlas Monitoring:
- Database performance
- Query analysis
- Connection metrics
- Storage usage
```

### 9.6 Backup & Recovery

```
Database Backups (MongoDB Atlas):
- Continuous backups (point-in-time recovery)
- Daily snapshots
- 7-day retention (M0 free tier)

Code Repository:
- GitHub (version control)
- Vercel deployment history
- Rollback capability
```

### 9.7 CI/CD Pipeline

```yaml
# Automated workflow on git push

1. Code Push to GitHub
   ↓
2. Vercel Webhook Triggered
   ↓
3. Build Process:
   - npm install
   - npm run build --turbopack
   - Type checking
   - ESLint validation
   ↓
4. Deploy to Edge Network (if build succeeds)
   ↓
5. Invalidate Cache
   ↓
6. Health Check (GET /api/health)
   ↓
7. Live! 🚀
```

---

## 10. Conclusion

This project design document outlines a comprehensive **Lost & Found Platform** that:

✅ **Solves a real problem**: Helps people recover lost items efficiently  
✅ **Uses modern tech**: Next.js 15, React 19, TypeScript, MongoDB Atlas  
✅ **Follows best practices**: RESTful API, security, scalability  
✅ **Production-ready**: Deployed on Vercel with proper CI/CD  
✅ **User-friendly**: Responsive design, intuitive interface  
✅ **Secure**: JWT auth, password hashing, input validation  
✅ **Scalable**: Serverless architecture, CDN, auto-scaling  

### Key Features Delivered:
1. QR code generation for items
2. Public scanning (no login required)
3. GPS location tracking
4. Scan history with Google Maps integration
5. Image upload for item identification
6. Secure authentication & authorization
7. Real-time dashboard with filters

### Future Enhancements:
- Email/SMS notifications
- Advanced analytics
- Multi-language support
- Mobile app (React Native)
- Social sharing
- Payment integration (premium features)

**Project Status**: ✅ **COMPLETED & DEPLOYED**  
**Live URL**: https://lost-found-platform-virid.vercel.app/

---

*Document Version: 1.0*  
*Last Updated: October 20, 2025*  
*Author: SYABANA ANDYDERIS (296530)*
