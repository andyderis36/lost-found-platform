# 02 - Architecture

This document outlines the system architecture, tech stack, directory structure, and database schema of the platform.

## Tech Stack

This project is built on top of a modern JavaScript/TypeScript ecosystem:
- **Core Framework**: Next.js 16 (App Router with Turbopack)
- **Programming Language**: TypeScript (Targeting modern ECMAScript)
- **Styling**: Tailwind CSS v4 (with Shadcn UI)
- **Database**: MongoDB (Atlas) with Mongoose (ODM)
- **Authentication**: JWT & Bcrypt.js
- **Data Validation**: Zod (Runtime & Type Validation)
- **Realtime**: Ably WebSocket (In-app Notifications)
- **Email**: Resend API
- **Security & Protection**: `rate-limiter-flexible` (API rate limiting), Stealth Mode (returns `404` for unauthorized admin paths), database details removal from health checks, and HttpOnly cookies
- **Unit Testing**: Vitest (Local testing with JSDOM and React Testing Library)

## Core Directory Structure (`src/`)

The application architecture follows the standard Next.js App Router conventions:

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # Backend API Endpoints (/api/auth, /api/items, etc.)
│   ├── admin/            # Admin Dashboard Pages
│   ├── dashboard/        # User Dashboard Pages
│   ├── items/            # Item Management Pages
│   ├── scan/             # Public QR Scan Pages (/scan/[qrCode])
│   ├── login/            # Authentication Pages
│   └── page.tsx          # Main Landing Page
├── components/           # Reusable UI Components (Navbar, Modal, ImageCropper)
└── contexts/             # React Context Providers (AuthContext)
```

## Design Patterns

1. **Server & Client Components**: The app maximizes React Server Components (RSC) for server-side data fetching, reducing client bundle size. Client Components (`"use client"`) are used exclusively when interactivity (hooks, event listeners) is necessary.
2. **API Routes as Micro-services**: The `src/app/api` directory segregates backend logic based on feature domains (auth, items, scans).
3. **Middleware Security**: Next.js Middleware is employed to protect routes that require authentication prior to rendering.

## Database Schema (MongoDB/Mongoose)

There are primary entities within the database schema:

1. **User Schema**: Stores user credentials, email verification status, and roles (User/Admin).
2. **Item Schema**: The core entity storing valuable item details, photos, custom metadata, QR codes (`nanoid`), status (Lost/Found/Active), and owner ID (reference to User).
3. **Scan History Schema**: Logs QR scans, GPS coordinates (optional), finder information (optional/anonymous), and timestamps.
4. **Notification Schema**: Stores in-app notification history delivered via Ably, ensuring retrievability upon page refresh.
