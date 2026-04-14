# 🚀 Implementation Plan: 3 Priority Features
## Lost & Found Platform - FYP PID154

**Document Version:** 1.0  
**Date:** April 2026  
**Stack:** Next.js 15, React 19, MongoDB, TypeScript  
**Status:** Ready for Execution

---

## 📑 Table of Contents

1. [Feature 1: Realtime In-App Notifications](#feature-1-realtime-in-app-notifications)
2. [Feature 2: Cloud Image Storage](#feature-2-cloud-image-storage)
3. [Feature 3: Rate-Limiting & Abuse Protection](#feature-3-rate-limiting--abuse-protection)
4. [Execution Order & Dependencies](#execution-order--dependencies)
5. [Combined AI Agent Prompt](#combined-ai-agent-prompt)
6. [QA Checklist](#qa-checklist)
7. [Rollback Plan](#rollback-plan)

---

## Feature 1: Realtime In-App Notifications

### 📌 Objective
Implement instant in-app notifications when items are scanned, providing owners with real-time feedback without relying solely on email. Users should see notifications in a UI notification center and receive toast alerts while online.

### ✅ Acceptance Criteria
- **Real-time delivery**: Online owners receive notifications instantly (< 1 second) when items are scanned
- **Notification Center**: Users can view all notifications (read/unread) in a dedicated UI component
- **Toast alerts**: Visual toast alerts appear in top-right corner on incoming notification
- **Read/Unread status**: Users can mark notifications as read/unread and filter by status
- **Database persistence**: All notifications stored in MongoDB `Notification` collection
- **Email fallback**: Existing email notifications continue as backup
- **Security**: Users can only receive notifications for their own items; channel access is authenticated
- **Graceful degradation**: System works without provider keys (notifications fallback to email only)

### 🎯 Implementation Steps

#### Step 1: Provider Selection & Setup
- **Recommended**: Pusher (simplest, good free tier) or Ably (alternative)
- **Alternative**: Self-hosted Socket.IO + Redis (more complex, but no vendor lock-in)
- **For this plan**: **Use Pusher** (hosted, requires minimal setup)

#### Step 2: Create Notification Model
```typescript
// src/models/Notification.ts
- userId: ObjectId (ref: User)
- type: string ('scan', 'item_update', 'system')
- title: string
- payload: object { itemId, itemName, foundLocation, scannedAt, etc }
- read: boolean (default: false)
- createdAt: Date (auto)
- updatedAt: Date (auto)
- expiresAt: Date (TTL index for auto-cleanup after 30 days)
```

#### Step 3: Add Notification API Endpoints
```
GET /api/notifications
  Query: page=1, limit=20, status=all|read|unread
  Response: { notifications: [], total, page, hasMore }
  Auth: JWT required

PATCH /api/notifications/:id/read
  Body: { read: boolean }
  Response: { notification: {...} }
  Auth: JWT required

PATCH /api/notifications/mark-all-read
  Response: { updatedCount: number }
  Auth: JWT required

DELETE /api/notifications/:id
  Response: { success: true }
  Auth: JWT required
```

#### Step 4: Update Scan Route to Emit Notifications
```
File: src/app/api/scans/route.ts (POST handler)
After Scan.create():
  1. Get item owner
  2. Create Notification record
  3. Publish event to Pusher channel `user-${owner.id}` with type 'scan_notification'
  4. Continue with existing email send
```

#### Step 5: Client-Side - Update AuthContext
```typescript
// src/contexts/AuthContext.tsx
On login/session restore:
  1. Initialize Pusher client with auth token
  2. Subscribe to channel `user-${userId}`
  3. Listen for 'scan_notification' event
  4. On event: 
     - Show toast/alert
     - Add to local notification state
     - Update unread counter
```

#### Step 6: UI Components
```
Create: src/components/NotificationCenter.tsx
  - Modal/dropdown showing list of notifications
  - Filter by read/unread
  - Mark as read on click
  - Delete notification button

Update: src/components/Navbar.tsx
  - Add bell icon with unread badge (red dot/count)
  - Click opens NotificationCenter
  - Badge updates in real-time
```

#### Step 7: Error Handling & Feature Flags
- If `PUSHER_KEY` not set: disable realtime, use email-only fallback
- Graceful error on Pusher pub/sub failure: log error, continue with email
- Client-side: if Pusher init fails, show fallback message "Notifications via email"

### 📁 Files to Modify/Create

| File | Action | Change |
|------|--------|--------|
| `src/models/Notification.ts` | CREATE | New Mongoose model |
| `src/app/api/notifications/route.ts` | CREATE | GET/PATCH endpoints |
| `src/app/api/notifications/[id]/route.ts` | CREATE | PATCH read, DELETE |
| `src/app/api/scans/route.ts` | MODIFY | Add notification emit after scan |
| `src/contexts/AuthContext.tsx` | MODIFY | Add Pusher subscription on login |
| `src/components/NotificationCenter.tsx` | CREATE | Notification list UI |
| `src/components/Navbar.tsx` | MODIFY | Add bell icon + badge |
| `src/lib/pusher.ts` | CREATE | Pusher client init + utils |
| `src/lib/auth.ts` | MODIFY | Add Pusher auth token helper |
| `.env.local` | MODIFY | Add PUSHER_* vars |
| `package.json` | MODIFY | Add `pusher` dependency |

### 🔑 Environment Variables

```bash
# Pusher (get from https://dashboard.pusher.com)
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret_key
PUSHER_CLUSTER=mt1  # or your region

# Optional: disable realtime (feature flag)
ENABLE_REALTIME_NOTIFICATIONS=true
```

### 🧪 Tests & Verification

#### Manual QA Flow
1. **Setup**: Register 2 users (owner, finder). Owner registers an item with QR.
2. **Test Real-time**:
   - Owner logs in → browser tab opens
   - Finder scans QR → notification should appear on owner's screen < 1s
   - Check Navbar bell icon shows unread badge
3. **Test Notification Center**:
   - Click bell icon → NotificationCenter opens
   - See list of notifications
   - Click notification → mark as read
   - Unread badge disappears
4. **Test Fallback**: Remove PUSHER_KEY, reload → verify email still sends
5. **Test DB**: Check MongoDB `notifications` collection has new record

#### Unit/Integration Tests (Jest/Vitest)
```typescript
// tests/api/notifications.test.ts
- GET /api/notifications returns user notifications
- PATCH /api/notifications/:id/read marks as read
- POST /api/scans creates notification in DB
- Mock Pusher publish call
```

### ⏱️ Estimated Time
**1–3 days** (depends on Pusher setup familiarity)
- Day 1: Model + APIs + Notification creation
- Day 2: Client-side subscription + UI
- Day 3: Testing + error handling

### 🚀 AI Agent Prompt (Realtime Notifications)

**Prompt for execution:**

```
Implement a complete realtime in-app notification system using Pusher.

REQUIREMENTS:
1. Create Mongoose model at src/models/Notification.ts with schema:
   - userId (ref: User)
   - type (string: scan, item_update, system)
   - title (string)
   - payload (object)
   - read (boolean, default: false)
   - createdAt, updatedAt, expiresAt (TTL 30 days)

2. Create Pusher utility at src/lib/pusher.ts with:
   - Pusher client initialization using env vars (PUSHER_*).
   - Helper function publishNotification(userId, notification) that publishes to channel `user-${userId}`.
   - Auth token generator for Presense authentication (for client-side auth).

3. Update POST /api/scans in src/app/api/scans/route.ts:
   - After Scan.create(), create a Notification record with the scan details.
   - Call publishNotification() to emit a 'scan_notification' event.
   - Keep existing email send unchanged (fallback).
   - Log errors but don't fail scan if Pusher fails.

4. Create API endpoints in src/app/api/notifications/route.ts:
   - GET: Return paginated notifications for authenticated user (query: page, limit, status).
   - PATCH: Mark all as read for user.
   - POST: (optional) Allow manual notification creation for testing.

5. Create src/app/api/notifications/[id]/route.ts:
   - PATCH: Mark specific notification as read.
   - DELETE: Delete notification.

6. Update src/contexts/AuthContext.tsx:
   - On login, initialize Pusher (if ENABLE_REALTIME_NOTIFICATIONS=true).
   - Subscribe to channel `user-${userId}`.
   - Listen for 'scan_notification' event; on receipt:
     * Create toast alert (use existing toast library or implement simple one).
     * Add to local notification state.
     * Update unread count.
   - On logout, unsubscribe.

7. Create src/components/NotificationCenter.tsx:
   - Modal/dropdown UI showing user's notifications (read/unread).
   - Click notification to mark read (calls API).
   - Delete button.
   - Filter by status (read/unread).
   - Pagination or infinite scroll.

8. Update src/components/Navbar.tsx:
   - Add bell icon in navbar (top-right area).
   - Show red badge with unread count when > 0.
   - Click opens NotificationCenter.
   - Badge updates in real-time on incoming notification.

9. Graceful fallback:
   - If PUSHER_KEY not set or ENABLE_REALTIME_NOTIFICATIONS=false:
     * Skip Pusher initialization.
     * Notifications still stored in DB.
     * UI shows "Realtime notifications disabled; check email for updates."
   - If Pusher publish fails: log error, continue (email is fallback).

10. Add tests in tests/api/notifications.test.ts (Jest/Vitest):
    - GET /api/notifications returns user's notifications.
    - PATCH /api/notifications/:id/read marks as read.
    - POST /api/scans creates Notification record (mock Pusher publish).
    - Verify Pusher publish called with correct channel.

11. Update package.json: add `pusher` dependency (latest).

12. Update .env.local documentation:
    - List required PUSHER_* vars with example values.
    - Add ENABLE_REALTIME_NOTIFICATIONS=true (default).

13. Commit changes with clear messages:
    - "feat: add Notification model and Pusher integration"
    - "feat: add notification API endpoints (GET, PATCH, DELETE)"
    - "feat: integrate realtime notifications in client (AuthContext, Navbar, NotificationCenter)"
    - "test: add notification API tests with Pusher mocks"

14. Include a brief setup guide in README:
    - Steps to get PUSHER_* keys.
    - How to test locally (create test scan, verify notification).
    - How to disable realtime (set env var).
```

---

## Feature 2: Cloud Image Storage

### 📌 Objective
Migrate image storage from embedded base64 strings in MongoDB to cloud-hosted URLs. This reduces database size, improves load times, and provides scalability. Existing base64 images should still be renderable; optional migration script converts old images.

### ✅ Acceptance Criteria
- **New uploads**: Images uploaded via client are stored on Cloudinary (or Vercel Blob) and URL is saved to `Item.image`
- **Existing images**: Base64 images continue to render (backward compatible)
- **Migration option**: Non-destructive migration script (`scripts/migrate-base64-to-cloudinary.js`) converts existing base64 images to cloud URLs
- **No data loss**: All images successfully uploaded and verified before replacing DB entry
- **Compression**: Images are auto-compressed on Cloudinary (3:4 aspect ratio, max 1000px)
- **CDN distribution**: Images served via Cloudinary CDN (faster, global distribution)
- **Graceful fallback**: If Cloudinary not configured, fallback to base64 (or reject upload with clear message)

### 🎯 Implementation Steps

#### Step 1: Provider Selection & Setup
- **Recommended**: Cloudinary (free tier includes 25 GB storage, unlimited API calls, auto-compression)
- **Alternative**: Vercel Blob (simpler but less transform features)
- **For this plan**: **Use Cloudinary**

#### Step 2: Create Image Upload Endpoint
```
File: src/app/api/images/upload/route.ts
Method: POST
Content-Type: multipart/form-data
Request body:
  - file (File) or base64 (string)
Validation:
  - Max file size: 10 MB
  - Allowed types: image/jpeg, image/png, image/webp
Response on success:
  { url: "https://res.cloudinary.com/...", publicId: "..." }
Response on error:
  { error: "...", code: "..." }
```

#### Step 3: Update Item Model Usage
```typescript
// src/models/Item.ts (schema already expects string for image)
image: {
  type: String,
  default: null
  // Can be: full URL (from Cloudinary) or base64 (legacy)
  // Client should detect and handle appropriately
}
```

#### Step 4: Update Client Upload Flow
```typescript
// Current flow (in forms/components):
1. User selects image
2. Client compresses → base64
3. Send base64 in Item.create() body

// NEW flow:
1. User selects image
2. Client compresses → File
3. FormData { file: File }
4. POST /api/images/upload
5. Get { url } from response
6. Include imageUrl in Item.create() body
```

#### Step 5: Update Item Create/Update Endpoints
```
File: src/app/api/items/route.ts (POST)
File: src/app/api/items/[id]/route.ts (PATCH)
Changes:
  - Accept imageUrl (string) instead of base64 embedded image
  - Validate URL is from trusted domain (Cloudinary or data: for legacy)
  - Store imageUrl in Item.image
```

#### Step 6: Create Migration Script
```javascript
// scripts/migrate-base64-to-cloudinary.js
1. Connect to MongoDB
2. Find all Items with base64 image (detect: starts with 'data:' or contains ',')
3. For each item:
   a. Upload base64 to Cloudinary
   b. Get returned URL
   c. Update Item.image with URL
   d. Log success/failure
4. Disconnect
5. Report: X items migrated, Y failed
```

#### Step 7: UI/Form Updates
```typescript
// Update item creation/edit forms:
- Image upload field now posts to /api/images/upload first
- Show loading spinner during upload
- Display preview from returned URL
- Handle errors (file size, type, upload failure)
```

#### Step 8: Error Handling & Feature Flags
- If `CLOUDINARY_CLOUD_NAME` not set:
  - Option A: Reject with error "Image upload not configured"
  - Option B: Fallback to base64 (not recommended for production)
- Upload failures: show user error, don't proceed with item creation
- Migration failures: log but continue (manual retry possible)

### 📁 Files to Modify/Create

| File | Action | Change |
|------|--------|--------|
| `src/app/api/images/upload/route.ts` | CREATE | New upload endpoint |
| `src/app/api/items/route.ts` | MODIFY | Use imageUrl instead of base64 |
| `src/app/api/items/[id]/route.ts` | MODIFY | Accept imageUrl |
| `src/lib/image.ts` | MODIFY | Add Cloudinary utilities |
| `src/components/ImageUploadForm.tsx` or form components | MODIFY | Upload to /api/images/upload first |
| `scripts/migrate-base64-to-cloudinary.js` | CREATE | Migration script |
| `src/models/Item.ts` | REVIEW | Ensure image field accepts URL strings |
| `.env.local` | MODIFY | Add CLOUDINARY_* vars |
| `package.json` | MODIFY | Add `cloudinary` dependency |

### 🔑 Environment Variables

```bash
# Cloudinary (get from https://cloudinary.com/console/settings/api-keys)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=lost-found-platform/items  # optional
```

### 🧪 Tests & Verification

#### Manual QA Flow
1. **New Upload**:
   - Create new item with image upload
   - Select image file → watch upload progress
   - Verify image displays in item detail
   - Check Cloudinary dashboard: image appears in media library
2. **Persistence**:
   - Refresh page → image still displays
   - Check MongoDB: Item.image is URL, not base64
3. **Migration** (if running):
   - Backup MongoDB first
   - Run `node scripts/migrate-base64-to-cloudinary.js --dry-run` (preview)
   - Run actual migration on test database
   - Verify all old items now have URL
   - Test rendering: old items still display correctly
4. **Error Cases**:
   - Try uploading file > 10 MB → error message
   - Try uploading non-image file → error message
   - Disconnect internet → upload fails gracefully
5. **Performance**:
   - Compare load time (before/after migration)
   - Check CDN serving: `curl -I image_url` → cache headers

#### Unit/Integration Tests
```typescript
// tests/api/images.test.ts
- POST /api/images/upload with valid file → returns URL
- POST /api/images/upload with oversized file → 413 error
- POST /api/images/upload with invalid type → 400 error
- Mock Cloudinary upload success/failure

// tests/api/items.test.ts
- POST /api/items with imageUrl → saved correctly
- POST /api/items without image → no error
```

### ⏱️ Estimated Time
**1–2 days**
- Day 1: Upload endpoint + client integration
- Day 2: Migration script + testing

### 🚀 AI Agent Prompt (Cloud Image Storage)

**Prompt for execution:**

```
Migrate image handling from base64 to Cloudinary cloud storage.

REQUIREMENTS:
1. Create new endpoint src/app/api/images/upload/route.ts:
   - Accept POST with multipart/form-data.
   - Extract file (or accept base64 string as fallback).
   - Validate: max 10 MB, allowed types (jpeg/png/webp).
   - Upload to Cloudinary using env vars CLOUDINARY_*.
   - Apply transformations: crop to 3:4 aspect ratio, max width 1000px, quality 85.
   - Return JSON { url, publicId, width, height } on success.
   - Return JSON { error, code } on failure (400/413/500).
   - Log all uploads (success/failure) for debugging.

2. Create Cloudinary utility at src/lib/cloudinary.ts:
   - Initialize Cloudinary client with env vars.
   - Function uploadImage(buffer, fileName, folder) → Promise<{url, publicId}>.
   - Function deleteImage(publicId) → Promise<boolean>.
   - Graceful error handling (throw user-friendly errors).

3. Update src/app/api/items/route.ts (POST /api/items):
   - Modify request schema: change image field to imageUrl (string, optional).
   - Remove base64 handling.
   - Accept and store imageUrl in Item.image field.
   - Deprecate old base64 image parameter (log warning if used).

4. Update src/app/api/items/[id]/route.ts (PATCH /api/items/:id):
   - Accept imageUrl in request.
   - Allow updating just imageUrl without re-uploading.
   - If old image exists and new one is uploaded, optionally delete old from Cloudinary.

5. Update client image upload components:
   - Identify where images are currently collected (likely item creation/edit forms).
   - Change upload flow:
     * Compress image client-side (existing logic).
     * Convert to File object.
     * FormData { file: File }.
     * POST /api/images/upload.
     * Get { url } from response.
     * Use url when calling Item.create/update endpoints.
   - Show loading spinner and progress during upload.
   - Handle upload errors and show user-friendly messages.

6. Review src/models/Item.ts:
   - image field should be String type.
   - Ensure no size restrictions on string (base64 sometimes has size limits).
   - Optionally add imagePublicId field to track Cloudinary asset for deletion.

7. Create migration script at scripts/migrate-base64-to-cloudinary.js:
   - Connect to MongoDB.
   - Query all Items where image field contains 'data:' or ',' (base64 pattern).
   - For each item:
     * Decode base64 to buffer.
     * Upload buffer to Cloudinary.
     * Update Item.image with returned URL.
     * Log success/failure.
   - Report total migrated, failed.
   - Support --dry-run flag to preview (log only, don't update).
   - Usage: node scripts/migrate-base64-to-cloudinary.js [--dry-run]

8. Add tests in tests/api/images.test.ts:
   - POST /api/images/upload with valid image file → returns url.
   - POST /api/images/upload with oversized file → 413.
   - POST /api/images/upload with non-image → 400.
   - POST /api/items with imageUrl → creates item with URL.
   - Mock Cloudinary upload success and failure scenarios.

9. Update package.json: add `cloudinary` and `next-cloudinary` (for React component if needed).

10. Update .env.local documentation: list CLOUDINARY_* vars with example values.

11. Add README section:
    - Steps to get Cloudinary API keys.
    - How to run migration: `node scripts/migrate-base64-to-cloudinary.js`.
    - How to test locally.

12. Commit changes:
    - "feat: add image upload endpoint with Cloudinary integration"
    - "feat: update item endpoints to use image URLs"
    - "feat: add migration script for base64 to Cloudinary"
    - "test: add image upload API tests"

13. Ensure backward compatibility:
    - Existing items with base64 image still render (base64 URLs still valid in <img> tags).
    - No breaking changes to public endpoints.
```

---

## Feature 3: Rate-Limiting & Abuse Protection

### 📌 Objective
Protect public endpoints (`POST /api/scans`, auth endpoints) from spam, brute-force, and abuse. Implement rate limiting that is configurable, persisted (Redis-backed), and provides clear feedback to clients.

### ✅ Acceptance Criteria
- **Per-IP rate limit**: Global limit on requests per IP (e.g., 100 requests/hour)
- **Per-resource debounce**: User cannot scan same QR code twice within 30 seconds
- **Auth protection**: Login/register/forgot-password endpoints limited to 5 attempts/15 min per IP
- **Clear feedback**: Return HTTP 429 with JSON explaining retry-after
- **Logging**: All blocked attempts logged for monitoring/abuse detection
- **Configurability**: Rate limits configurable via env vars
- **Feature flag**: Can be disabled for development via env var
- **Redis optional**: Use Redis if available, fallback to in-memory (not suitable for production multi-process)

### 🎯 Implementation Steps

#### Step 1: Choose Library
- **Recommended**: `rate-limiter-flexible` (supports Redis + memory, fine-grained control)
- **Alternative**: `express-rate-limit` (simpler, but less flexible)
- **For this plan**: **Use `rate-limiter-flexible` with Redis backend**

#### Step 2: Create Rate Limiter Utility
```typescript
// src/lib/rateLimiter.ts
Exports:
  - InitRateLimiter() → initializes Redis or in-memory store
  - limitByIP(ip, keyPrefix, points, durationSeconds) → Promise<boolean>
  - limitByIPAndResource(ip, resourceId, points, durationSeconds) → Promise<boolean>
  - logBlockedAttempt(ip, endpoint, reason) → void
  - on error: log but don't throw (fail-open: allow request if limiter crashes)
```

#### Step 3: Protect Scan Endpoint
```
File: src/app/api/scans/route.ts
Add at start of POST handler:
  1. Check global IP limit (100 req/hour)
  2. Check per-(IP+qrCode) debounce (1 req/30s)
  3. If either exceeded: return 429 with { error, retryAfter }
  4. Log blocked attempt
  5. Continue if both pass
```

#### Step 4: Protect Auth Endpoints
```
Files: src/app/api/auth/login/route.ts
       src/app/api/auth/register/route.ts
       src/app/api/auth/forgot-password/route.ts
Add at start of POST handler:
  1. Check IP limit (5 attempts / 15 minutes)
  2. For login/forgot-password: also check per-email limit (5 attempts / 15 min)
  3. If exceeded: return 429
  4. Continue if pass
```

#### Step 5: Add Logging
```typescript
// src/lib/rateLimiter.ts
logBlockedAttempt(ip, endpoint, reason):
  - Log to console (dev)
  - Send to external logging service if available (prod)
  - Include: timestamp, ip, endpoint, reason, user-agent
```

#### Step 6: Configuration
```
Environment variables:
  REDIS_URL=redis://localhost:6379  (optional, fallback to in-memory)
  RATE_LIMIT_ENABLED=true
  RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
  RATE_LIMIT_AUTH_ATTEMPTS=5
  RATE_LIMIT_AUTH_WINDOW_MINUTES=15
  RATE_LIMIT_SCAN_DEBOUNCE_SECONDS=30
```

#### Step 7: Error Response Format
```json
{
  "error": "Too many requests from this IP",
  "code": "RATE_LIMIT_EXCEEDED",
  "retryAfter": 300,
  "endpoint": "/api/scans"
}
```

#### Step 8: Graceful Fallback
- If `RATE_LIMIT_ENABLED=false`: skip all checks
- If Redis connection fails: log error, continue with request (fail-open)
- If in-memory store approaches limit: log warning but serve requests

### 📁 Files to Modify/Create

| File | Action | Change |
|------|--------|--------|
| `src/lib/rateLimiter.ts` | CREATE | Rate limiter utility |
| `src/app/api/scans/route.ts` | MODIFY | Add rate limiting before logic |
| `src/app/api/auth/login/route.ts` | MODIFY | Add auth rate limiting |
| `src/app/api/auth/register/route.ts` | MODIFY | Add auth rate limiting |
| `src/app/api/auth/forgot-password/route.ts` | MODIFY | Add auth rate limiting |
| `.env.local` | MODIFY | Add rate limit env vars |
| `package.json` | MODIFY | Add `rate-limiter-flexible` |
| `middleware.ts` (if exists) or new | REVIEW | Consider global middleware (optional) |

### 🔑 Environment Variables

```bash
# Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
RATE_LIMIT_AUTH_ATTEMPTS=5
RATE_LIMIT_AUTH_WINDOW_MINUTES=15
RATE_LIMIT_SCAN_DEBOUNCE_SECONDS=30

# Redis (optional, for persistence across server restarts)
REDIS_URL=redis://localhost:6379
# If not set: use in-memory store (dev only)
```

### 🧪 Tests & Verification

#### Manual QA Flow
1. **Scan Debounce**:
   - Scan same QR code twice rapidly (< 30s) → second request should return 429
   - Wait 30s, scan again → should succeed
2. **IP-based Limit**:
   - Make 101 requests from same IP in 1 hour → 101st returns 429
   - Verify other IPs unaffected
3. **Auth Protection**:
   - Try login 6 times with wrong password → 6th attempt returns 429
   - Try from different IP → allowed to attempt again
4. **Error Response**:
   - Verify 429 returns JSON with `error`, `retryAfter` fields
   - Verify client displays helpful message
5. **Logging**:
   - Check server logs: blocked attempts logged
6. **Feature Flag**:
   - Set `RATE_LIMIT_ENABLED=false` → all limits bypassed
   - Requests succeed regardless of frequency

#### Unit/Integration Tests
```typescript
// tests/lib/rateLimiter.test.ts
- limitByIP() returns false after threshold exceeded
- limitByIP() resets after window expires
- limitByIPAndResource() enforces debounce
- Mock Redis and in-memory store separately

// tests/api/scans.test.ts (with rate limiter)
- POST /api/scans rate-limited per IP
- POST /api/scans debounced per (IP+qrCode)
- 429 response includes retryAfter

// tests/api/auth.test.ts (with rate limiter)
- POST /api/auth/login rate-limited per IP
- 5 failed attempts → 6th blocked with 429
```

### ⏱️ Estimated Time
**0.5–1.5 days**
- Day 1 (morning): Implement rate limiter + tests
- Day 1 (afternoon): Integrate into endpoints + manual testing

### 🚀 AI Agent Prompt (Rate-Limiting)

**Prompt for execution:**

```
Add production-ready rate limiting to protect public endpoints.

REQUIREMENTS:
1. Create src/lib/rateLimiter.ts using `rate-limiter-flexible`:
   - Initialize with Redis backend if REDIS_URL set, fallback to in-memory.
   - Export async function limitByIP(ip, keyPrefix, points, durationSeconds) → boolean.
   - Export async function limitByIPAndResource(ip, resource, points, durationSeconds) → boolean.
   - Export function logBlockedAttempt(ip, endpoint, reason, userAgent) → void (log to console/service).
   - On error (Redis down, etc.), log but don't throw; return true (allow request).

2. Update src/app/api/scans/route.ts (POST handler):
   - At start, extract client IP from request headers.
   - Call limitByIP(ip, 'scan', 100, 3600) for global per-IP limit.
   - Call limitByIPAndResource(ip, qrCode, 1, 30) for debounce (1 scan per 30s per qrCode).
   - If either blocked: return HTTP 429 with JSON { error, retryAfter, code: 'RATE_LIMIT_EXCEEDED' }.
   - Call logBlockedAttempt() if blocked.
   - Continue normal flow if pass.

3. Update src/app/api/auth/login/route.ts (POST handler):
   - At start, extract client IP.
   - Call limitByIP(ip, 'auth-login', 5, 900) (5 attempts per 15 min).
   - If blocked: return 429.
   - Also consider: after failed login, track failed attempt (independent from this limiter, or via separate key).

4. Update src/app/api/auth/register/route.ts (POST handler):
   - Apply limitByIP(ip, 'auth-register', 5, 900).
   - Return 429 if exceeded.

5. Update src/app/api/auth/forgot-password/route.ts (POST handler):
   - Apply limitByIP(ip, 'auth-forgot', 5, 900).
   - Optionally also limit per email address (similar to login).

6. Environment variables (documented in .env.local):
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
   RATE_LIMIT_AUTH_ATTEMPTS=5
   RATE_LIMIT_AUTH_WINDOW_MINUTES=15
   RATE_LIMIT_SCAN_DEBOUNCE_SECONDS=30
   REDIS_URL=redis://localhost:6379 (optional)

7. Add tests in tests/lib/rateLimiter.test.ts:
   - limitByIP() enforces threshold.
   - limitByIP() resets after window.
   - Mock Redis and in-memory stores.
   - Test error handling (Redis down → request allowed).

8. Add integration tests in tests/api/scans.test.ts:
   - Mock rate limiter.
   - POST /api/scans under limit → success.
   - POST /api/scans over limit → 429.
   - Verify 429 response format.

9. Add helper function to extract client IP from request:
   - Handle X-Forwarded-For, X-Real-IP headers (for proxies/vercel).
   - Fallback to req.ip or connection IP.
   - Return consistent IP string for rate limit key.

10. Update package.json: add `rate-limiter-flexible` and `redis` (optional).

11. Add graceful degradation:
    - If RATE_LIMIT_ENABLED=false: bypass all checks.
    - If Redis unavailable: log error, use in-memory (warn in logs).
    - If rate limiter crashes: fail-open (allow request).

12. Logging:
    - Log all 429 responses: { ip, endpoint, timestamp, reason }.
    - Include in server logs and optionally send to external logger.

13. Update README:
    - Explain rate limits (per endpoint).
    - How to configure limits via env vars.
    - How to test locally.
    - Optional: Redis setup for production.
    - Monitoring: how to check blocked_attempts logs.

14. Commit changes:
    - "feat: add rate-limiter-flexible with Redis backend"
    - "feat: apply rate limiting to scan and auth endpoints"
    - "test: add rate limiter tests (mocked)"
    - "docs: update README with rate limit configuration"

15. Verification steps:
    - Test 429 response format and headers.
    - Test Retry-After header (returned by rate-limiter-flexible).
    - Verify logs show blocked attempts.
    - Test with RATE_LIMIT_ENABLED=false (all requests allowed).
```

---

## Execution Order & Dependencies

### 📊 Recommended Execution Sequence

```
Phase 1 (Priority: CRITICAL - Security)
└── Feature 3: Rate-Limiting & Abuse Protection
    ├─ Quickest to implement (0.5–1.5 days)
    ├─ Protects public endpoints immediately
    └─ No external dependencies

Phase 2 (Priority: HIGH - UX)
└── Feature 1: Realtime In-App Notifications
    ├─ Depends on: Rate-limiting (optional, for scan endpoint)
    ├─ Medium complexity (1–3 days)
    └─ Best to do after rate limiting for stability

Phase 3 (Priority: HIGH - Infra)
└── Feature 2: Cloud Image Storage
    ├─ Depends on: Feature 1 (optional, can run parallel)
    ├─ Non-breaking (backward compatible with base64)
    ├─ Can be done concurrently with Feature 1
    └─ Estimated: 1–2 days
```

### 🎯 Optimal Timeline (Sequential)

| Feature | Start | End | Notes |
|---------|-------|-----|-------|
| Rate-Limiting | Day 1 (Mon) | Day 1.5 (Tue morning) | Complete first |
| Notifications | Day 2 (Tue) | Day 4 (Thu) | Start after rate limit |
| Cloud Storage | Day 4 (Thu) | Day 5.5 (Fri afternoon) | Can start parallel with notifications |

**Total estimated time: 5.5 days (1 week including testing/QA)**

### 🔗 Dependency Notes
- **Feature 1 → Feature 3**: Optional. Rate limiting can be applied to scan endpoint that emits notifications for defense-in-depth.
- **Feature 2 → Feature 1**: None (independent).
- **Feature 2 → Feature 3**: None (independent).
- **Parallel execution possible**: Feature 1 and 2 can be worked on simultaneously by different developers (no code conflicts expected).

---

## Combined AI Agent Prompt

### 🚀 Single Comprehensive Execution Prompt

Use this prompt to execute all 3 features in one AI agent session:

```
OBJECTIVE:
Implement three production-ready features for the Lost & Found Platform:
1. Rate-Limiting & Abuse Protection
2. Realtime In-App Notifications (Pusher)
3. Cloud Image Storage (Cloudinary)

Execute in this order and commit each feature separately with clear commit messages.

================================================================================

FEATURE 1: RATE-LIMITING & ABUSE PROTECTION
Status: Execute FIRST

1. Create src/lib/rateLimiter.ts using rate-limiter-flexible package:
   - Initialize with Redis (env: REDIS_URL) or in-memory fallback.
   - Export: limitByIP(ip, keyPrefix, points, duration).
   - Export: limitByIPAndResource(ip, resource, points, duration).
   - Export: logBlockedAttempt(ip, endpoint, reason, ua).
   - Fail-open (on error, allow request).

2. Implement IP extraction utility in src/lib/rateLimiter.ts:
   - Handle X-Forwarded-For, X-Real-IP headers.
   - Consistent IP string for rate limit keys.

3. Update src/app/api/scans/route.ts (POST):
   - Extract client IP.
   - Check: limitByIP(ip, 'scan', 100, 3600) — 100 req/hour.
   - Check: limitByIPAndResource(ip, qrCode, 1, 30) — 1 req per 30s per code.
   - Return 429 { error, retryAfter, code } if blocked.

4. Update src/app/api/auth/login/route.ts, register, forgot-password:
   - Check: limitByIP(ip, 'auth-login', 5, 900) — 5 attempts per 15 min.
   - Return 429 if exceeded.

5. Add env vars to .env.local:
   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
   REDIS_URL=redis://localhost:6379 (optional)

6. Write tests in tests/lib/rateLimiter.test.ts:
   - Test limitByIP threshold enforcement.
   - Test window reset.
   - Mock Redis and in-memory.
   - Test error handling (fail-open).

7. Update package.json: add rate-limiter-flexible, redis.

8. Commit:
   - "feat: add rate limiter utility with Redis support"
   - "feat: apply rate limiting to scan and auth endpoints"
   - "test: add rate limiter tests"

================================================================================

FEATURE 2: REALTIME IN-APP NOTIFICATIONS
Status: Execute SECOND (depends on Feature 1 for stability)

1. Create src/models/Notification.ts (Mongoose schema):
   - userId (ref: User)
   - type (string)
   - title (string)
   - payload (object)
   - read (boolean, default: false)
   - createdAt, updatedAt
   - expiresAt (TTL: 30 days)

2. Create src/lib/pusher.ts:
   - Initialize Pusher client using env vars PUSHER_*.
   - Export: publishNotification(userId, notificationData).
   - Handle failures gracefully.

3. Create API endpoints:
   - GET /api/notifications — return user's notifications (paginated).
   - PATCH /api/notifications/:id/read — mark as read.
   - DELETE /api/notifications/:id — delete.

4. Update src/app/api/scans/route.ts (POST):
   - After Scan.create(), create Notification record.
   - Call publishNotification(ownerId, {...}).
   - Keep email send unchanged (fallback).
   - Log errors but don't fail scan.

5. Update src/contexts/AuthContext.tsx:
   - On login: initialize Pusher (if ENABLE_REALTIME_NOTIFICATIONS=true).
   - Subscribe to channel: user-${userId}.
   - Listen for 'scan_notification' event.
   - On event: show toast, add to state, update unread count.
   - On logout: unsubscribe.

6. Create src/components/NotificationCenter.tsx:
   - Modal/dropdown showing notifications.
   - Filter by read/unread.
   - Click to mark read.
   - Delete button.
   - Pagination or infinite scroll.

7. Update src/components/Navbar.tsx:
   - Add bell icon (top-right).
   - Show unread badge (red dot or count).
   - Click opens NotificationCenter.
   - Update in real-time on notification.

8. Add graceful fallback:
   - If PUSHER_KEY not set: skip Pusher, show message.
   - If Pusher pub/sub fails: log, continue (email fallback).

9. Update package.json: add pusher.

10. Write tests in tests/api/notifications.test.ts:
    - GET /api/notifications returns user's notifications.
    - PATCH mark as read.
    - Mock Pusher publish.
    - POST /api/scans creates Notification.

11. Commit:
    - "feat: add Notification model and Pusher integration"
    - "feat: add notification API endpoints"
    - "feat: integrate realtime notifications in client"
    - "test: add notification tests"

================================================================================

FEATURE 3: CLOUD IMAGE STORAGE
Status: Execute THIRD (can run parallel with Feature 2)

1. Create src/app/api/images/upload/route.ts:
   - Accept POST multipart/form-data.
   - File size max: 10 MB.
   - Types: jpeg, png, webp.
   - Upload to Cloudinary using CLOUDINARY_*.
   - Transforms: 3:4 aspect crop, max 1000px, quality 85.
   - Return { url, publicId } or { error }.

2. Create src/lib/cloudinary.ts:
   - Initialize Cloudinary client.
   - Function uploadImage(buffer, fileName, folder) → { url, publicId }.
   - Function deleteImage(publicId) → boolean.
   - User-friendly error messages.

3. Update client image upload flow:
   - Compress client-side (existing logic).
   - Convert to File.
   - FormData { file: File }.
   - POST /api/images/upload.
   - Use returned URL when creating/editing Item.

4. Update src/app/api/items/route.ts (POST):
   - Accept imageUrl (string) instead of base64.
   - Validate URL trusted (Cloudinary or data: for legacy).

5. Update src/app/api/items/[id]/route.ts (PATCH):
   - Accept imageUrl.

6. Create scripts/migrate-base64-to-cloudinary.js:
   - Connect MongoDB.
   - Find items with base64 image (detect 'data:' or ',').
   - For each: upload to Cloudinary, update Item.image.
   - Report success/failed.
   - Support --dry-run.
   - Usage: node scripts/migrate-base64-to-cloudinary.js [--dry-run]

7. Add env vars:
   CLOUDINARY_CLOUD_NAME=...
   CLOUDINARY_API_KEY=...
   CLOUDINARY_API_SECRET=...

8. Write tests in tests/api/images.test.ts:
   - POST /api/images/upload with valid file → URL.
   - Oversized file → 413.
   - Invalid type → 400.
   - Mock Cloudinary.

9. Update package.json: add cloudinary.

10. Commit:
    - "feat: add image upload endpoint with Cloudinary"
    - "feat: update item endpoints for image URLs"
    - "feat: add base64-to-Cloudinary migration script"
    - "test: add image upload tests"

================================================================================

FINAL STEPS:

1. Update README.md:
   - Section: Environment Variables Setup
     * List PUSHER_*, CLOUDINARY_*, REDIS_URL, RATE_LIMIT_* vars.
     * Example .env.local values.
   - Section: Feature Setup
     * How to get Pusher/Cloudinary API keys.
     * How to run migration script.
     * How to test locally.
   - Section: Rate Limiting
     * Explain limits.
     * How to configure.

2. Write comprehensive commit messages (follow conventional commits):
   - feat: short desc
   - Detailed body explaining what/why/how.

3. Ensure all tests pass:
   - npm run test (or configured test command)
   - All new endpoints tested.
   - External providers mocked.

4. Code quality:
   - No console.errors (use structured logging).
   - Proper error handling throughout.
   - Type safety (TypeScript strict mode).

5. Final verification:
   - Start dev server: npm run dev.
   - Manual QA per feature (see QA Checklist below).
   - No breaking changes to existing endpoints.

ACCEPTANCE CRITERIA:
✅ All tests pass
✅ No console errors on startup
✅ Rate limiting blocks 429 on exceed
✅ Notifications emit and display in real-time
✅ Image uploads to Cloudinary and URL saved
✅ Migration script runs without data loss
✅ README updated with env vars and setup
✅ All features work with provider keys not set (graceful fallback)
✅ Clean commit history
```

---

## QA Checklist

### Pre-Release Verification

#### Feature 1: Rate-Limiting
- [ ] **Scan debounce**: Scan same QR twice in 15s → 2nd request returns 429
- [ ] **Retry-After header**: 429 response includes `Retry-After` header
- [ ] **IP rate limit**: 101 requests from same IP → 101st returns 429
- [ ] **Auth limits**: 6th login attempt (same IP) returns 429
- [ ] **Feature flag**: `RATE_LIMIT_ENABLED=false` allows unlimited requests
- [ ] **Logging**: Server logs show blocked attempt with IP, endpoint, timestamp
- [ ] **Redis fallback**: Works with Redis unavailable (in-memory)
- [ ] **Tests pass**: `npm run test` shows all rate limiter tests passing
- [ ] **No normal requests blocked**: Requests under limit succeed immediately
- [ ] **Client handling**: UI shows user-friendly "too many requests" message

#### Feature 2: Realtime Notifications
- [ ] **Real-time delivery**: Owner receives notification < 1 second after scan
- [ ] **Toast alert**: Toast appears in top-right corner
- [ ] **Unread badge**: Navbar bell icon shows unread count (red or number)
- [ ] **Notification Center UI**: Click bell → shows list of notifications
- [ ] **Mark as read**: Click notification → marked as read, removed from unread
- [ ] **DB persistence**: Check MongoDB → `notifications` collection has new records
- [ ] **Email fallback**: Email still sent after scan (existing flow unchanged)
- [ ] **Graceful fallback**: `PUSHER_KEY` not set → notifications absent, email only, no errors
- [ ] **Deletion**: Delete notification → removed from list and DB
- [ ] **Pagination**: Notifications list shows pagination/scroll correctly
- [ ] **Multiple tabs**: Login on 2 tabs → both receive notification
- [ ] **Tests pass**: All notification API tests passing
- [ ] **Pusher stats**: Check Pusher dashboard → events recorded

#### Feature 3: Cloud Image Storage
- [ ] **New upload**: Create item with image → uploads to Cloudinary, URL saved to Item.image
- [ ] **URL stored**: MongoDB query shows `Item.image` is URL, not base64
- [ ] **Image renders**: Item detail page displays image correctly
- [ ] **CDN served**: Image loads fast (Cloudinary CDN)
- [ ] **File size validation**: Try uploading 20 MB file → 413 error
- [ ] **Type validation**: Try uploading .gif file → 400 error
- [ ] **Progress indicator**: Upload shows loading spinner
- [ ] **Existing base64 images**: Old items with base64 still render correctly
- [ ] **Migration dry-run**: `node scripts/migrate-base64-to-cloudinary.js --dry-run` logs changes without saving
- [ ] **Migration actual**: Run migration on test DB → all base64 converted to URLs, no data loss
- [ ] **Edit item**: Update existing item image → new URL properly saved
- [ ] **Cloudinary dashboard**: Check Cloudinary account → images appear in media library
- [ ] **Tests pass**: All image upload tests passing
- [ ] **No env vars**: `CLOUDINARY_CLOUD_NAME` not set → graceful error or rejection (verify behavior)

#### Cross-Feature
- [ ] **No breaking changes**: Existing endpoints work as before
- [ ] **All tests pass**: `npm run test` (full suite)
- [ ] **TypeScript strict mode**: No type errors
- [ ] **No console errors**: Browser console clean on startup and after interactions
- [ ] **Environment cleanup**: `.env.local` has only necessary vars documented
- [ ] **Commit history**: Clean, small commits per task
- [ ] **README**: Fully updated with setup instructions

#### Performance Checks
- [ ] **Page load**: Dashboard loads quickly (no noticeable delay from notifications)
- [ ] **Notification responsiveness**: Toast appears immediately on event
- [ ] **Image upload speed**: Upload completes in < 5s (depending on image size)

#### Security Checks
- [ ] **Auth token validation**: Only authenticated users get their notifications
- [ ] **Channel access**: User cannot subscribe to other user's notification channel
- [ ] **Rate limit bypass attempt**: Changing IP header doesn't bypass limits
- [ ] **Image path traversal**: Cannot upload/view images outside intended folder
- [ ] **XSS prevention**: Notification payload sanitized (no raw HTML execution)

---

## Rollback Plan

### In Case of Issues

#### Feature 1: Rate-Limiting
```bash
# Quick disable
Set env: RATE_LIMIT_ENABLED=false
Restart server

# Full rollback
git revert <commit-sha-rate-limiter>
npm install (if dependencies changed)
Restart server
```

#### Feature 2: Realtime Notifications
```bash
# Quick disable
Set env: ENABLE_REALTIME_NOTIFICATIONS=false
Restart server (notifications still in DB but not streamed)

# Delete notifications collection (if corrupted)
mongo> use lostfound
mongo> db.notifications.drop()

# Full rollback
git revert <feature-2-commits>
npm install
Restart server
```

#### Feature 3: Cloud Image Storage
```bash
# Revert to base64
git revert <feature-3-commits>

# If migration ran, restore MongoDB from backup
mongorestore --archive=backup.archive

# Verify Image.image field is still base64 in existing docs
db.items.findOne({_id: ObjectId("...")})
```

#### Emergency Disable All Features
```bash
# Set all feature flags
RATE_LIMIT_ENABLED=false
ENABLE_REALTIME_NOTIFICATIONS=false
CLOUDINARY_CLOUD_NAME=""

Restart server → all new features disabled, falls back to original behavior
```

### Monitoring
- Set up alerts for rate limiter blocking (threshold logging)
- Monitor Pusher connection errors (check dashboard)
- Monitor Cloudinary upload failures (check logs)

---

## Success Metrics

| Feature | Success Metric |
|---------|---|
| Rate-Limiting | Zero spam/brute-force attempts on scan endpoint (logs show blocklist); normal users unaffected |
| Notifications | Owner receives notification within 1s of scan; 95%+ toast display rate |
| Cloud Storage | 100% of new images stored on Cloudinary; load time < 2s per image; > 80% reduction in DB size |

---

## Next Steps (Post-MVP)

1. **Enhanced Notifications**: Notification preferences (opt-in/out by type), notification scheduling
2. **Image Management**: Batch upload, image gallery, social sharing
3. **Advanced Rate Limiting**: Adaptive limits based on user reputation, whitelist/blacklist
4. **Analytics**: Track notification engagement, image views, scan success rate
5. **Caching**: Add Redis caching for frequently accessed items/notifications

---

**End of Implementation Plan**

*For questions or updates, refer to the combined AI agent prompt or consult individual feature sections.*
