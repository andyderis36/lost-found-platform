# 03 - API Reference

This application utilizes Next.js Route Handlers (`src/app/api/`) as its backend. This documentation covers the most critical endpoints.

## Standard Conventions

- **Base URL**: `/api`
- **Data Format**: `application/json`
- **Authentication**: Bearer Token in the authorization header (`Authorization: Bearer <token>`) or stored in cookies for Next.js sessions.
- **Validation**: All payloads are validated against Zod schemas prior to processing.
- **Rate Limiting**: Authentication endpoints are rate-limited via `rate-limiter-flexible` to throttle request traffic.
- **Stealth Mode**: Unauthorized requests to admin routes return `404 Not Found` to conceal endpoint presence.

---

## Authentication Module (`/api/auth/*`)

### 1. User Registration
- **Endpoint**: `POST /api/auth/register`
- **Payload**: `{ email, password, name }`
- **Action**: Hashes the password (Bcrypt), creates a user record, and dispatches a verification email.

### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email, role } }`
- **Action**: Verifies credentials and issues a JWT token.

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Headers**: Requires Authentication.
- **Action**: Returns the currently authenticated user's profile based on the token.

---

## Item Module (`/api/items/*`)

### 1. List Owned Items
- **Endpoint**: `GET /api/items`
- **Headers**: Requires Authentication (User/Admin).
- **Action**: Retrieves all items registered by the authenticated user.

### 2. Create New Item
- **Endpoint**: `POST /api/items`
- **Headers**: Requires Authentication.
- **Payload**: `{ name, category, description, customFields, image }`
- **Action**: Generates a unique QR code (`nanoid`), stores compressed image data, and creates an Item entity.

### 3. Update Item Status
- **Endpoint**: `PATCH /api/items/[id]`
- **Headers**: Requires Authentication.
- **Payload**: `{ status: 'Lost' | 'Found' | 'Active' | 'Inactive' }`

---

## Scan & Notification Module (`/api/scans/*`)

### 1. Record QR Scan
- **Endpoint**: `POST /api/scans/[qrCode]`
- **Access**: Public (No authentication required).
- **Payload**: `{ location?, contactDetails?, message? }`
- **Action**: 
  1. Records the scan history.
  2. Triggers a realtime notification via Ably to the item owner's channel.
  3. Triggers an email alert via Resend.

---

## Admin Module (`/api/admin/*`)

### 1. Platform Statistics
- **Endpoint**: `GET /api/admin/stats`
- **Headers**: Requires Authentication (Admin Role).
- **Action**: Returns total users, total registered items, and other metrics.
- **Security**: Stealth Mode enabled (returns `404 Not Found` for unauthorized/non-admin users).

### 2. User Management
- **Endpoint**: `GET /api/admin/users`
- **Headers**: Requires Authentication (Admin Role).
- **Action**: Lists all registered users.
- **Security**: Stealth Mode enabled.

### 3. Item Management
- **Endpoint**: `GET /api/admin/items`
- **Headers**: Requires Authentication (Admin Role).
- **Action**: Lists all registered items.
- **Security**: Stealth Mode enabled.

---

## Utility Endpoints

### 1. Health Check
- **Endpoint**: `GET /api/health`
- **Access**: Public
- **Response**: `{ status: "ok", timestamp: "..." }`
- **Security**: Clean check page that does not disclose system details (e.g., database names or tech stack).
