#!/usr/bin/env node
/*
 * AI AGENT EXECUTION PROMPT
 * ========================
 * 
 * Lost & Found Platform - 3 Priority Features Implementation
 * 
 * USAGE:
 * 1. Copy the prompt below
 * 2. Paste into GitHub Copilot chat
 * 3. Or use with AI agent API
 * 
 * EXECUTION MODE:
 * - Sequential: One feature at a time
 * - Parallelizable: Features 1 and 2, then Feature 3
 * 
 * DEPENDENCIES:
 * - Existing Next.js 15 project (MongoDB, TypeScript)
 * - API keys for Pusher (free tier OK) and Cloudinary (free tier OK)
 * - Redis (optional, will fallback to in-memory)
 * 
 * EXPECTED OUTCOME:
 * - PR-ready code with tests
 * - Passing unit/integration tests
 * - README updates
 * - Clean commit history
 */

const AGENT_PROMPT_V1 = `
COMPREHENSIVE 3-FEATURE IMPLEMENTATION
================================================================================

PROJECT: Lost & Found Platform (PID154 FYP)
STATUS: Implementing 3 priority features in priority order
LANGUAGE: TypeScript/JavaScript
FRAMEWORK: Next.js 15 with TypeScript, React 19
DATABASE: MongoDB + Mongoose

EXECUTION PLAN:
- Feature 1: Rate-Limiting & Abuse Protection (1-1.5 days)
- Feature 2: Realtime In-App Notifications (1-3 days) 
- Feature 3: Cloud Image Storage (1-2 days)

CONSTRAINTS:
✓ Backward compatible (no breaking changes)
✓ Graceful fallback (works without external API keys)
✓ Test coverage (mock external providers)
✓ Type-safe (TypeScript strict mode)
✓ Error handling (fail-open for external deps)

================================================================================
FEATURE 1: RATE-LIMITING & ABUSE PROTECTION
================================================================================

PRIORITY: CRITICAL (Security)
TIMELINE: Day 1 (0.5–1.5 days)
DEPENDENCIES: rate-limiter-flexible, redis (optional)

IMPLEMENTATION:

1. Create src/lib/rateLimiter.ts

   Key requirements:
   - Use rate-limiter-flexible library
   - Initialize with Redis backend (env: REDIS_URL) or in-memory fallback
   - Export async function: limitByIP(ip, keyPrefix, points, durationSeconds) → boolean
   - Export async function: limitByIPAndResource(ip, resource, points, durationSeconds) → boolean
   - Export function: logBlockedAttempt(ip, endpoint, reason, userAgent) → void
   - IP extraction: handle X-Forwarded-For, X-Real-IP headers (Vercel compatibility)
   - Error handling: on Redis error, log but don't throw (fail-open)
   - Feature flag: check RATE_LIMIT_ENABLED env var

2. Update src/app/api/scans/route.ts

   Add to POST handler (early, before main logic):
   
   const clientIp = extractClientIp(request);
   
   // Global per-IP limit: 100 requests per hour
   const globalLimited = await rateLimiter.limitByIP(
     clientIp, 
     'scan', 
     100, 
     3600
   );
   if (globalLimited) {
     return ApiResponse(429, { 
       error: 'Too many requests', 
       retryAfter: 3600,
       code: 'RATE_LIMIT_EXCEEDED'
     });
   }
   
   // Per-(IP+qrCode) debounce: 1 request per 30 seconds
   const debounced = await rateLimiter.limitByIPAndResource(
     clientIp,
     qrCode,
     1,
     30
   );
   if (debounced) {
     return ApiResponse(429, {
       error: 'Please wait before scanning again',
       retryAfter: 30,
       code: 'RATE_LIMIT_DEBOUNCE'
     });
   }

3. Update src/app/api/auth/login/route.ts

   Add to POST handler:
   
   const clientIp = extractClientIp(request);
   const authLimited = await rateLimiter.limitByIP(
     clientIp,
     'auth-login',
     5,     // 5 attempts
     900    // per 15 minutes
   );
   if (authLimited) {
     return ApiResponse(429, {
       error: 'Too many login attempts. Try again in 15 minutes.',
       retryAfter: 900,
       code: 'AUTH_RATE_LIMIT'
     });
   }

4. Apply same pattern to:
   - src/app/api/auth/register/route.ts (5 attempts per 15 min)
   - src/app/api/auth/forgot-password/route.ts (5 attempts per 15 min)

5. Environment Variables (.env.local)

   RATE_LIMIT_ENABLED=true
   RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
   RATE_LIMIT_AUTH_ATTEMPTS=5
   RATE_LIMIT_AUTH_WINDOW_MINUTES=15
   RATE_LIMIT_SCAN_DEBOUNCE_SECONDS=30
   REDIS_URL=redis://localhost:6379

6. Add tests in tests/lib/rateLimiter.test.ts

   - Test limitByIP() enforces threshold (100 calls → 101st blocked)
   - Test limit resets after time window
   - Test limitByIPAndResource() debounces per resource
   - Mock Redis (ioredis-mock) and test in-memory fallback
   - Verify fail-open behavior (Redis error → allow request)

7. Update package.json

   Add dependencies: "rate-limiter-flexible": "latest"
   Add optional: "redis": "latest"

8. Commit messages:
   - "feat: add rate-limiter-flexible utility with Redis backend"
   - "feat: apply rate limiting to scan endpoint"
   - "feat: apply rate limiting to auth endpoints (login, register, forgot-password)"
   - "test: add rate limiter and IP extraction tests"
   - "docs: add rate limit configuration to README"

================================================================================
FEATURE 2: REALTIME IN-APP NOTIFICATIONS
================================================================================

PRIORITY: HIGH (UX)
TIMELINE: Days 2–4 (1–3 days)
DEPENDENCIES: pusher

IMPLEMENTATION:

1. Create src/models/Notification.ts

   Mongoose schema with fields:
   {
     userId: { type: ObjectId, ref: 'User', required: true },
     type: { type: String, enum: ['scan', 'item_update', 'system'], required: true },
     title: { type: String, required: true },
     payload: { type: Object, default: {} },
       // payload includes: itemId, itemName, foundLocation, scannedAt, finderPhone, etc.
     read: { type: Boolean, default: false },
     createdAt: { type: Date, default: Date.now },
     updatedAt: { type: Date, default: Date.now },
     expiresAt: { type: Date, default: () => new Date(Date.now() + 30*24*60*60*1000) }
   }
   
   Add index: { expiresAt: 1 } with expireAfterSeconds: 0 (TTL cleanup)
   Add index: { userId: 1, createdAt: -1 } (query optimization)

2. Create src/lib/pusher.ts

   Initialize Pusher client:
   import Pusher from 'pusher';
   
   export const pusher = new Pusher({
     appId: process.env.PUSHER_APP_ID,
     key: process.env.PUSHER_KEY,
     secret: process.env.PUSHER_SECRET,
     cluster: process.env.PUSHER_CLUSTER || 'mt1',
     useTLS: true
   });
   
   Export helper:
   export async function publishNotification(
     userId: string,
     notificationData: NotificationPayload
   ): Promise<void> {
     if (!pusher) return; // Graceful fallback if not configured
     
     try {
       await pusher.trigger(
         \`user-\${userId}\`,
         'scan_notification',
         notificationData
       );
     } catch (error) {
       console.error('[Pusher] Publish failed:', error);
       // Don't throw; email is fallback
     }
   }
   
   Export auth helper for channel auth:
   export function getPusherAuthToken(socketId: string, userId: string): string {
     return pusher.authenticate(socketId, \`user-\${userId}\`);
   }

3. Create API endpoints

   GET /api/notifications
   - Query params: page (default 1), limit (default 20), status ('all'|'read'|'unread')
   - Returns: { notifications: [...], total, page, hasMore }
   - Auth: JWT required
   
   PATCH /api/notifications/:id/read
   - Body: { read: boolean }
   - Returns: { notification: {...} }
   - Auth: JWT required, user must own notification
   
   DELETE /api/notifications/:id
   - Returns: { success: true }
   - Auth: JWT required, user must own notification
   
   PATCH /api/notifications/mark-all-read
   - Returns: { updatedCount: number }
   - Auth: JWT required

4. Update src/app/api/scans/route.ts

   After creating Scan document:
   
   // Create notification for item owner
   const owner = await User.findById(item.userId);
   if (owner) {
     const notification = await Notification.create({
       userId: owner._id,
       type: 'scan',
       title: \`Your item '\${item.name}' was scanned\`,
       payload: {
         itemId: item._id,
         itemName: item.name,
         foundLocation: scan.location,
         scannedAt: scan.createdAt
       }
     });
     
     // Publish realtime event
     await publishNotification(owner._id.toString(), {
       notificationId: notification._id,
       ...notification.toObject()
     });
   }
   
   // Keep existing email send (fallback)
   await sendEmailNotification(...);

5. Update src/contexts/AuthContext.tsx

   On login (in useEffect):
   
   if (user && process.env.NEXT_PUBLIC_ENABLE_REALTIME==='true') {
     // Initialize Pusher
     import Pusher from 'pusher-js';
     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
       cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1'
     });
     
     // Subscribe to user channel
     const channel = pusher.subscribe(\`user-\${user.id}\`);
     
     channel.bind('scan_notification', (data) => {
       // Show toast
       toast.success(\`Notification: \${data.title}\`);
       
       // Add to notifications state
       setNotifications(prev => [data, ...prev]);
       setUnreadCount(prev => prev + 1);
     });
     
     // Cleanup on logout
     return () => pusher.unsubscribe(\`user-\${user.id}\`);
   }

6. Create src/components/NotificationCenter.tsx

   Component showing:
   - List of notifications (paginated or infinite scroll)
   - Filter: read/unread/all
   - Click notification → mark as read
   - Delete button
   - Timestamp relative (e.g., "2 minutes ago")
   
   UI: Modal or dropdown accessed via bell icon

7. Update src/components/Navbar.tsx

   Add bell icon:
   - Icon with red badge showing unread count (if > 0)
   - Click opens NotificationCenter
   - Badge updates real-time on incoming notification
   - Mobile responsive

8. Environment variables (.env.local + .env.example)

   # Pusher (https://dashboard.pusher.com)
   NEXT_PUBLIC_PUSHER_KEY=your_public_key
   NEXT_PUBLIC_PUSHER_CLUSTER=mt1
   PUSHER_APP_ID=your_app_id
   PUSHER_SECRET=your_secret
   
   # Feature flag
   ENABLE_REALTIME_NOTIFICATIONS=true

9. Graceful fallback

   If PUSHER_KEY not set:
   - Skip Pusher initialization
   - Log warning
   - Notifications stored in DB but not streamed
   - Email still sent
   - UI shows: "Realtime notifications disabled"
   
   If Pusher publish fails:
   - Log error
   - Continue (email fallback)
   - Retry mechanism optional

10. Add tests in tests/api/notifications.test.ts

    - GET /api/notifications returns paginated notifications
    - PATCH mark single notification as read
    - PATCH mark all read
    - POST /api/scans creates Notification record
    - Mock Pusher SDK
    - Verify Pusher publish called on scan

11. Update package.json

    Add: "pusher": "latest"
    Add (dev): "pusher-js": "latest"

12. Commit messages:
    - "feat: add Notification model with TTL index"
    - "feat: add Pusher integration and utilities"
    - "feat: add notification API endpoints (GET, PATCH, DELETE)"
    - "feat: integrate realtime notifications in AuthContext"
    - "feat: add NotificationCenter component and navbar bell icon"
    - "test: add notification API tests with Pusher mocks"

================================================================================
FEATURE 3: CLOUD IMAGE STORAGE
================================================================================

PRIORITY: HIGH (Infrastructure)
TIMELINE: Days 4–5.5 (1–2 days)
DEPENDENCIES: cloudinary

IMPLEMENTATION:

1. Create src/app/api/images/upload/route.ts

   POST endpoint:
   - Accept multipart/form-data with file field
   - File validation:
     * Size: max 10 MB
     * Type: image/jpeg, image/png, image/webp
   - Upload to Cloudinary using cloudinary-sdk
   - Apply transforms: crop 3:4, max 1000px width, quality 85
   - Return: { url: string, publicId: string }
   - Error response: { error: string, code: string }

2. Create src/lib/cloudinary.ts

   Initialize Cloudinary:
   
   const cloudinary = require('cloudinary').v2;
   cloudinary.config({
     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
     api_key: process.env.CLOUDINARY_API_KEY,
     api_secret: process.env.CLOUDINARY_API_SECRET
   });
   
   Export function uploadImage():
   - Accept buffer or file path
   - Upload with folder: process.env.CLOUDINARY_FOLDER || 'lost-found-platform/items'
   - Apply transformations
   - Return { url, publicId }
   - Throw user-friendly errors
   
   Export function deleteImage(publicId):
   - Delete from Cloudinary
   - Return boolean

3. Update client image upload flow

   Current flow (remove):
   - User selects image → compress → base64 data URL
   - Include base64 in POST /api/items body
   
   New flow:
   - User selects image → compress → File object
   - Create FormData { file: File }
   - POST /api/images/upload
   - Receive { url }
   - Include url in POST /api/items body
   
   Implementation in:
   - Item creation form
   - Item edit form
   - Any image upload UI

4. Update src/app/api/items/route.ts (POST)

   Change parameter:
   - Old: image: string (base64)
   - New: imageUrl: string (cloud URL)
   
   Validation:
   - Allow URL starting with https:// (Cloudinary domain or data: for legacy)
   - Store in Item.image field

5. Update src/app/api/items/[id]/route.ts (PATCH)

   Accept imageUrl in request body
   Update Item.image with URL
   Optional: if new image uploaded, delete old image from Cloudinary

6. Create scripts/migrate-base64-to-cloudinary.js

   Migration script:
   
   const mongoose = require('mongoose');
   const Items = require('../src/models/Item.ts');
   const { uploadImage } = require('../src/lib/cloudinary.ts');
   
   async function migrate(dryRun = false) {
     await mongoose.connect(process.env.MONGODB_URI);
     
     const items = await Items.find({
       image: { 
         $regex: /^data:|,/  // Matches base64
       }
     });
     
     console.log(\`Found \${items.length} items with base64 images\`);
     
     for (const item of items) {
       try {
         const { url } = await uploadImage(item.image);
         
         if (!dryRun) {
           item.image = url;
           await item.save();
           console.log(\`✓ Migrated: \${item._id}\`);
         } else {
           console.log(\`[DRY-RUN] Would migrate: \${item._id}\`);
         }
       } catch (error) {
         console.error(\`✗ Failed: \${item._id} - \${error.message}\`);
       }
     }
     
     await mongoose.disconnect();
   }
   
   const dryRun = process.argv.includes('--dry-run');
   migrate(dryRun);
   
   Usage:
   - node scripts/migrate-base64-to-cloudinary.js --dry-run (preview)
   - node scripts/migrate-base64-to-cloudinary.js (execute)

7. Environment variables (.env.local)

   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   CLOUDINARY_FOLDER=lost-found-platform/items

8. Add tests in tests/api/images.test.ts

   - POST /api/images/upload with valid image → returns url
   - POST with file > 10 MB → 413 error
   - POST with non-image file → 400 error
   - Mock Cloudinary upload
   - Verify transforms applied
   - Test error handling

9. Update package.json

   Add: "cloudinary": "latest"
   Add (dev): "next-cloudinary": "latest"

10. Graceful fallback

    If CLOUDINARY_CLOUD_NAME not set:
    - Option A: Return 503 error "Image upload service unavailable"
    - Option B: Log warning, fallback to base64 (not recommended for prod)
    
    Error handling:
    - File too large: 413
    - Invalid type: 400
    - Upload failure: 500 (with details in logs)

11. Add tests in tests/api/items.test.ts

    - POST /api/items with imageUrl → saved in Item.image
    - PATCH /api/items/:id with imageUrl → updated
    - Backward compat: old items with base64 still render
    - Verify image field type is string

12. Commit messages:
    - "feat: add image upload endpoint with Cloudinary"
    - "feat: update item endpoints to accept image URLs"
    - "feat: add base64-to-Cloudinary migration script"
    - "test: add image upload API tests"

================================================================================
FINAL STEPS
================================================================================

1. Update README.md

   Add sections:
   - Environment Variables Setup (list all RATE_LIMIT_*, PUSHER_*, CLOUDINARY_*)
   - Feature Setup Instructions (get API keys for each provider)
   - Migration Guide (how to run base64 migration)
   - Testing Guide (manual QA steps per feature)

2. Ensure all tests pass:

   npm run test
   npm run build (TypeScript check)
   npm run lint

3. Code quality:

   - No console.log() (use structured logging if needed)
   - Error handling on all external calls
   - Type-safe (no 'any' types)
   - Comments on complex logic

4. Commit history:

   Use conventional commits (feat:, test:, docs:, fix:)
   Clear commit messages with body explaining why

5. No breaking changes:

   - Existing endpoints still work
   - Old base64 images still render
   - Email still sent (not replaced by notifications)

================================================================================
ACCEPTANCE CRITERIA (All must pass)
================================================================================

✅ All tests pass (npm run test)
✅ TypeScript builds without errors (npm run build)
✅ No lint errors (npm run lint)
✅ Rate limit returns 429 on exceed / normal requests work
✅ Notifications emit real-time / appear in UI / stored in DB
✅ Images upload to Cloudinary / URLs saved / migration runs
✅ README updated with env vars and setup docs
✅ Feature flags work (graceful fallback when env vars not set)
✅ Clean commit history (small, focused commits)

================================================================================

Execute in order: Feature 1 → Feature 2 → Feature 3

Reference: IMPLEMENTATION_PLAN.md for detailed specs, QA checklist, and rollback procedures.
`;

module.exports = { AGENT_PROMPT_V1 };

// Export as plain text for easy copying
console.log(AGENT_PROMPT_V1);
