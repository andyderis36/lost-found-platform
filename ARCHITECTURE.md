# 🏗️ Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      LOST & FOUND PLATFORM                  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                         FRONTEND                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Next.js    │  │  React 19    │  │  Tailwind    │     │
│  │   App Router │  │  Components  │  │     CSS      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       API ROUTES                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     /auth    │  │    /items    │  │    /scans    │     │
│  │   register   │  │   CRUD ops   │  │   logging    │     │
│  │     login    │  │  QR generate │  │   contact    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth Utils  │  │  QR Utils    │  │  API Utils   │     │
│  │  JWT/bcrypt  │  │  Generation  │  │  Responses   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │     User     │  │     Item     │  │     Scan     │     │
│  │    Model     │  │    Model     │  │    Model     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      MONGODB ATLAS                          │
│              (Cloud Database - Free Tier)                   │
└─────────────────────────────────────────────────────────────┘
```

## User Flow Diagrams

### 1. Item Registration Flow
```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│  User   │──────│  Login  │──────│Register │──────│   QR    │
│ Register│      │   JWT   │      │  Item   │      │Generated│
└─────────┘      └─────────┘      └─────────┘      └─────────┘
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
  Create          Get Token        Save to DB      Display QR
  Account         (7 days)         + Generate      Print/Save
                                   QR Code ID
```

### 2. Item Found Flow
```
┌─────────┐      ┌─────────┐      ┌─────────┐      ┌─────────┐
│ Finder  │──────│  Scan   │──────│ Contact │──────│  Owner  │
│  Finds  │      │   QR    │      │  Form   │      │Notified │
│  Item   │      │  Code   │      │         │      │         │
└─────────┘      └─────────┘      └─────────┘      └─────────┘
     │                │                 │                 │
     ▼                ▼                 ▼                 ▼
  Scan QR         Get Item         Fill Info        Email/SMS
  with Phone      Details          (optional)       to Owner
                  from DB          Location
```

### 3. Data Relationships
```
┌───────────────────────────────────────────────────────────┐
│                         USER                              │
│  • _id (ObjectId)                                         │
│  • email (unique)                                         │
│  • name                                                   │
│  • passwordHash                                           │
└───────────────────────────────────────────────────────────┘
                        │
                        │ 1:N (One user, many items)
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                         ITEM                              │
│  • _id (ObjectId)                                         │
│  • userId (ref: User)                                     │
│  • qrCode (unique: LF-XXXXXXXXXX)                         │
│  • name, category, status                                 │
│  • image, description                                     │
└───────────────────────────────────────────────────────────┘
                        │
                        │ 1:N (One item, many scans)
                        │
                        ▼
┌───────────────────────────────────────────────────────────┐
│                         SCAN                              │
│  • _id (ObjectId)                                         │
│  • itemId (ref: Item)                                     │
│  • scannerEmail, scannerPhone                             │
│  • location (lat, lng)                                    │
│  • message                                                │
│  • scannedAt (timestamp)                                  │
└───────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────────────────────────────────────────────────────┐
│                    REGISTRATION                          │
└──────────────────────────────────────────────────────────┘
    Email + Password + Name
              │
              ▼
    Validate (email format, password strength)
              │
              ▼
    Hash password with bcrypt (salt rounds: 10)
              │
              ▼
    Save user to MongoDB
              │
              ▼
    Generate JWT token (expires: 7 days)
              │
              ▼
    Return token + user info

┌──────────────────────────────────────────────────────────┐
│                       LOGIN                              │
└──────────────────────────────────────────────────────────┘
    Email + Password
              │
              ▼
    Find user by email
              │
              ▼
    Compare password with bcrypt
              │
              ▼
    Generate JWT token (expires: 7 days)
              │
              ▼
    Return token + user info

┌──────────────────────────────────────────────────────────┐
│                  PROTECTED ROUTES                        │
└──────────────────────────────────────────────────────────┘
    Request with Header: Authorization: Bearer <token>
              │
              ▼
    Extract token from header
              │
              ▼
    Verify JWT signature
              │
              ▼
    Decode token → get userId + email
              │
              ▼
    Allow access to protected resource
```

## QR Code Generation Flow

```
┌──────────────────────────────────────────────────────────┐
│                  QR CODE CREATION                        │
└──────────────────────────────────────────────────────────┘
    User creates new item
              │
              ▼
    Generate unique ID: LF-XXXXXXXXXX (nanoid)
              │
              ▼
    Create scan URL: {BASE_URL}/scan/LF-XXXXXXXXXX
              │
              ▼
    Generate QR code image (300x300px)
              │
              ▼
    Save item with qrCode ID to database
              │
              ▼
    Return item + QR code data URL
              │
              ▼
    Display QR for user to download/print

┌──────────────────────────────────────────────────────────┐
│                   QR CODE SCANNING                       │
└──────────────────────────────────────────────────────────┘
    Finder scans QR code
              │
              ▼
    Redirect to: {BASE_URL}/scan/LF-XXXXXXXXXX
              │
              ▼
    Fetch item details by qrCode
              │
              ▼
    Display item info (name, category, image)
              │
              ▼
    Show contact form for finder
              │
              ▼
    Log scan with finder info & location
              │
              ▼
    Send notification to item owner
```

## Security Considerations

```
✅ Passwords hashed with bcrypt (salt rounds: 10)
✅ JWT tokens expire after 7 days
✅ Email validation on registration
✅ Password strength requirements
✅ MongoDB connection with authentication
✅ Environment variables for secrets
✅ Input validation on all API endpoints
✅ HTTPS in production (Vercel)
✅ Rate limiting (to be implemented)
✅ CORS configuration (Next.js default)

⚠️  TODO for Production:
   - Add rate limiting
   - Implement refresh tokens
   - Add CAPTCHA on registration
   - Add email verification
   - Implement 2FA (optional)
   - Add API request logging
```

## Technology Stack Breakdown

```
┌───────────────────┬──────────────────────────────────────┐
│   Category        │   Technology                         │
├───────────────────┼──────────────────────────────────────┤
│   Frontend        │   Next.js 15, React 19               │
│   Styling         │   Tailwind CSS v4                    │
│   Language        │   TypeScript                         │
│   Database        │   MongoDB Atlas (Free Tier)          │
│   ODM             │   Mongoose                           │
│   Authentication  │   JWT, bcryptjs                      │
│   QR Generation   │   qrcode library                     │
│   QR Scanning     │   html5-qrcode (to be added)         │
│   Unique IDs      │   nanoid                             │
│   Deployment      │   Vercel (recommended)               │
│   Version Control │   Git + GitHub                       │
└───────────────────┴──────────────────────────────────────┘
```

## Deployment Architecture (Future)

```
┌─────────────────────────────────────────────────────────┐
│                    VERCEL DEPLOYMENT                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Frontend   │  │   API Routes │  │  Edge Funcs  │ │
│  │   (Static)   │  │  (Serverless)│  │   (Optional) │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              EXTERNAL SERVICES                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  MongoDB     │  │  Cloudinary  │  │   SendGrid   │ │
│  │   Atlas      │  │   (Images)   │  │   (Email)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

**Architecture designed for scalability and maintainability** 🏗️
