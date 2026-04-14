# 🎯 Quick Execution Guide
## 3 Priority Features - Fast Reference

**Print this page for quick reference during development**

---

## Feature Execution Order

```
┌─────────────────────────────────────────────────────────┐
│ FEATURE 1: Rate-Limiting (Day 1 - 0.5-1.5 days)         │
│ Why first: Security, quick win, no external deps        │
│ Files: src/lib/rateLimiter.ts + route.ts updates        │
│ Env: RATE_LIMIT_ENABLED, REDIS_URL, RATE_LIMIT_*        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ FEATURE 2: Realtime Notifications (Day 2-4 - 1-3 days)  │
│ Why second: After rate limit, depends on stability      │
│ Files: src/models/Notification.ts, API endpoints        │
│ Env: PUSHER_APP_ID, PUSHER_KEY, PUSHER_SECRET, etc      │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ FEATURE 3: Cloud Storage (Day 4-5.5 - 1-2 days)         │
│ Why third: Can run parallel with Feature 2              │
│ Files: src/app/api/images/upload/route.ts               │
│ Env: CLOUDINARY_CLOUD_NAME, API_KEY, API_SECRET         │
└─────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist: Before Starting Each Feature

### Before Feature 1
- [ ] Branch: `git checkout -b feature/rate-limiting`
- [ ] Read: src/app/api/scans/route.ts
- [ ] Read: src/app/api/auth/*/route.ts
- [ ] Plan: Redis setup (local or skip for dev)

### Before Feature 2
- [ ] Branch: `git checkout -b feature/realtime-notifications`
- [ ] Create: Pusher free account → get API keys
- [ ] Read: src/contexts/AuthContext.tsx
- [ ] Read: src/components/Navbar.tsx
- [ ] Review: Toast library availability (Tailwind, or add one)

### Before Feature 3
- [ ] Branch: `git checkout -b feature/cloud-storage`
- [ ] Create: Cloudinary free account → get API keys
- [ ] Read: Image compression logic (ImageCropper.tsx, imageCompression.ts)
- [ ] Backup: MongoDB (before migration)

---

## 🔑 Required Environment Variables (All)

```bash
# ============ Feature 1: Rate-Limiting ============
RATE_LIMIT_ENABLED=true
RATE_LIMIT_MAX_REQUESTS_PER_HOUR=100
RATE_LIMIT_AUTH_ATTEMPTS=5
RATE_LIMIT_AUTH_WINDOW_MINUTES=15
RATE_LIMIT_SCAN_DEBOUNCE_SECONDS=30
REDIS_URL=redis://localhost:6379  # Optional (fallback to memory)

# ============ Feature 2: Notifications ============
ENABLE_REALTIME_NOTIFICATIONS=true
PUSHER_APP_ID=your_app_id
PUSHER_KEY=your_public_key
PUSHER_SECRET=your_secret_key
PUSHER_CLUSTER=mt1

# ============ Feature 3: Cloud Storage ============
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=lost-found-platform/items
```

---

## 🚀 Core Files to Create/Modify per Feature

### Feature 1: Rate-Limiting
**Create:**
- `src/lib/rateLimiter.ts`
- `tests/lib/rateLimiter.test.ts`

**Modify:**
- `src/app/api/scans/route.ts`
- `src/app/api/auth/login/route.ts`
- `src/app/api/auth/register/route.ts`
- `src/app/api/auth/forgot-password/route.ts`
- `package.json`

---

### Feature 2: Realtime Notifications
**Create:**
- `src/models/Notification.ts`
- `src/lib/pusher.ts`
- `src/app/api/notifications/route.ts`
- `src/app/api/notifications/[id]/route.ts`
- `src/components/NotificationCenter.tsx`
- `tests/api/notifications.test.ts`

**Modify:**
- `src/contexts/AuthContext.tsx`
- `src/components/Navbar.tsx`
- `src/app/api/scans/route.ts` (add notification emit)
- `package.json`

---

### Feature 3: Cloud Storage
**Create:**
- `src/app/api/images/upload/route.ts`
- `src/lib/cloudinary.ts`
- `scripts/migrate-base64-to-cloudinary.js`
- `tests/api/images.test.ts`

**Modify:**
- `src/app/api/items/route.ts` (POST)
- `src/app/api/items/[id]/route.ts` (PATCH)
- Image upload components (client)
- `package.json`

---

## ✅ Testing Commands

```bash
# Lint
npm run lint

# Type check
npm run build  # Uses Next.js type checking

# Run tests (if configured)
npm run test

# Or Jest directly
npx jest

# Test specific feature
npx jest tests/lib/rateLimiter.test.ts
npx jest tests/api/notifications.test.ts
npx jest tests/api/images.test.ts
```

---

## 🔍 Quick Manual Testing

### Feature 1: Rate-Limiting
```bash
# In browser console or Postman:

# Test scan debounce (should return 429 on 2nd request):
curl -X POST http://localhost:3000/api/scans \
  -H "Content-Type: application/json" \
  -d '{"qrCode":"test-code", ...}' \
  # Call twice rapidly → 2nd should be 429

# Test auth rate limiting (try 6x):
for i in {1..6}; do
  curl -X POST http://localhost:3000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com", "password":"wrong"}'
done
# 6th should return 429
```

### Feature 2: Notifications
```bash
# Setup:
1. Register 2 users (owner, finder)
2. Owner creates item with QR
3. Owner stays logged in
4. Finder scans QR

# Check:
- Bell icon shows unread (1)
- Toast appears on owner's screen
- MongoDB: db.notifications.find() shows new record
- Click notification: marked read, count goes to 0
```

### Feature 3: Cloud Storage
```bash
# Test upload endpoint:
curl -F "file=@/path/to/image.jpg" \
  http://localhost:3000/api/images/upload

# Response should be:
# {"url":"https://res.cloudinary.com/...", "publicId":"..."}

# Test migration:
node scripts/migrate-base64-to-cloudinary.js --dry-run
# Check output: should show "X items to migrate"

node scripts/migrate-base64-to-cloudinary.js
# Should upload and update DB
```

---

## 🔗 Dependencies to Add

```bash
# Feature 1
npm install rate-limiter-flexible redis

# Feature 2
npm install pusher

# Feature 3
npm install cloudinary next-cloudinary

# All features (install all at once)
npm install rate-limiter-flexible redis pusher cloudinary next-cloudinary
```

---

## 📊 Success Criteria Per Feature

| Feature | Must Pass |
|---------|-----------|
| Rate-Limiting | 429 on rate exceed; no false positives on normal requests |
| Notifications | Real-time toast + Bell badge updates; DB records created |
| Cloud Storage | Image URL saved; CDN serves; migration runs without data loss |

---

## 🆘 Quick Troubleshooting

### Rate-Limiting Not Working
- [ ] `RATE_LIMIT_ENABLED=true` in .env?
- [ ] Is Redis running? (if using Redis)
- [ ] Check server logs for rate limiter errors
- [ ] Try `RATE_LIMIT_ENABLED=false` to disable and verify request goes through

### Notifications Not Appearing
- [ ] Pusher keys correct in .env?
- [ ] Check Pusher dashboard: are events being published?
- [ ] Browser console: Pusher initialization errors?
- [ ] Check MongoDB: Notification documents exist?
- [ ] Try `ENABLE_REALTIME_NOTIFICATIONS=false` to disable realtime

### Image Upload Failing
- [ ] Cloudinary keys correct?
- [ ] File size < 10 MB?
- [ ] File type = jpeg/png/webp?
- [ ] Check server logs: upload errors?
- [ ] Cloudinary quota reached? (check dashboard)

---

## 📁 File Organization After Implementation

```
src/
├── app/api/
│   ├── scans/route.ts (MODIFIED - add rate limit + notification)
│   ├── auth/
│   │   ├── login/route.ts (MODIFIED - rate limit)
│   │   ├── register/route.ts (MODIFIED - rate limit)
│   │   └── forgot-password/route.ts (MODIFIED - rate limit)
│   ├── items/
│   │   ├── route.ts (MODIFIED - use imageUrl)
│   │   └── [id]/route.ts (MODIFIED - use imageUrl)
│   ├── images/
│   │   └── upload/route.ts (NEW - Cloudinary upload)
│   └── notifications/
│       ├── route.ts (NEW - GET, PATCH all)
│       └── [id]/route.ts (NEW - PATCH, DELETE single)
├── components/
│   ├── Navbar.tsx (MODIFIED - add bell icon)
│   ├── NotificationCenter.tsx (NEW)
│   └── ImageCropper.tsx (MODIFIED - client upload flow)
├── contexts/
│   └── AuthContext.tsx (MODIFIED - Pusher subscription)
├── lib/
│   ├── rateLimiter.ts (NEW)
│   ├── pusher.ts (NEW)
│   ├── cloudinary.ts (NEW)
│   └── ... (existing)
├── models/
│   └── Notification.ts (NEW)
└── ... (rest unchanged)
tests/
├── lib/
│   └── rateLimiter.test.ts (NEW)
├── api/
│   ├── notifications.test.ts (NEW)
│   └── images.test.ts (NEW)
└── ... (existing)
scripts/
└── migrate-base64-to-cloudinary.js (NEW)
```

---

## 💾 Commit Template

```bash
# Feature 1 - Rate-Limiting
git commit -m "feat: add rate limiter utility with Redis support"
git commit -m "feat: apply rate limiting to scan and auth endpoints"
git commit -m "test: add rate limiter tests"

# Feature 2 - Notifications
git commit -m "feat: add Notification model and Pusher integration"
git commit -m "feat: add notification API endpoints"
git commit -m "feat: integrate realtime notifications in client"
git commit -m "test: add notification tests"

# Feature 3 - Cloud Storage
git commit -m "feat: add image upload endpoint with Cloudinary"
git commit -m "feat: update item endpoints for image URLs"
git commit -m "feat: add base64-to-Cloudinary migration script"
git commit -m "test: add image upload tests"

# Final
git commit -m "docs: update README with feature setup guides"
```

---

## 🎓 Key Learning Points

1. **Rate-Limiting**: Fail-open pattern (allow request on limiter error)
2. **Notifications**: Graceful fallback (Pusher optional, email fallback)
3. **Cloud Storage**: Backward compatibility (base64 still works)
4. **Architecture**: Minimize external dependencies, use env flags to toggle features

---

**Reference**: See IMPLEMENTATION_PLAN.md for detailed specifications, AI agent prompts, and QA checklist.

Last Updated: April 14, 2026
