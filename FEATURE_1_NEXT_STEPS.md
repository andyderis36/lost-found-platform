# 🎬 Feature 1 - NEXT STEPS

## ✅ What Has Been Completed

All code for **Feature 1: Rate-Limiting & Abuse Protection** has been implemented:

- ✅ `src/lib/rateLimiter.ts` - Rate limiter utility (created)
- ✅ `src/app/api/scans/route.ts` - Added rate limiting (modified)
- ✅ `src/app/api/auth/login/route.ts` - Added auth rate limiting (modified)
- ✅ `src/app/api/auth/register/route.ts` - Added auth rate limiting (modified)
- ✅ `src/app/api/auth/forgot-password/route.ts` - Added auth rate limiting (modified)
- ✅ `tests/rateLimiter.test.ts` - Unit tests (created)
- ✅ `.env.local` - Configuration added (modified)
- ✅ `package.json` - Dependencies added (modified)

---

## 🚀 NOW YOU NEED TO:

### Step 1: Install Dependencies (2 minutes)

```powershell
npm install
```

Or if you want to install just the rate limiter:
```powershell
npm install rate-limiter-flexible
```

**Output should show:**
```
added X packages
```

### Step 2: Verify Installation (1 minute)

```powershell
npm run build
```

**Expected**: Build succeeds without TypeScript errors

### Step 3: Start Dev Server (2 minutes)

```powershell
npm run dev
```

**Expected**: Server starts on http://localhost:3000  
**Check**: No errors in console, rate limiter initialized

### Step 4: Quick Manual Test (5 minutes)

**Test Rate Limiting is Active:**

In a new terminal (keep dev server running):

```powershell
# Test scan endpoint rate limit
$uri = "http://localhost:3000/api/scans"
$headers = @{"Content-Type" = "application/json"}

# Send 101 requests rapidly to test rate limiting
# (We'll do 5 for quick test, you can do full 101 later)
for ($i = 1; $i -le 5; $i++) {
  $body = @{
    qrCode = "test-qr-123"
    scannerName = "TestScanner$i"
    scannerEmail = "test$i@example.com"
  } | ConvertTo-Json
  
  $response = Invoke-WebRequest -Uri $uri -Method Post -Headers $headers -Body $body -ErrorAction SilentlyContinue
  Write-Host "Request $i: HTTP $($response.StatusCode)"
}

# Expected: Requests 1-4 get 404 (item not found) or 400 (invalid), 
#           Request 5 might get 429 if debounce triggers on same QR code
```

### Step 5: Check Tests (2 minutes)

```powershell
npm run test -- --testPathPattern=rateLimiter
```

**Expected**: All tests pass

Or if using Jest directly:
```powershell
npx jest tests/rateLimiter.test.ts
```

---

## 📋 Checklist Before Proceeding

- [ ] `npm install` completed successfully
- [ ] `npm run build` shows no TypeScript errors
- [ ] `npm run dev` server starts without errors
- [ ] Rate limiter functions appear in logs
- [ ] Tests pass (or you understand why they're skipped)
- [ ] `.env.local` has rate limiting vars

---

## 🎯 What to Expect

### When Rate Limiting Works:
- **429 Response**: "Too many requests" with Retry-After header
- **Logs**: Console shows `[RATE_LIMITER] Blocked attempt: ...`
- **Header**: `Retry-After` header in response (seconds to wait)

### If Rate Limiting NOT Working:
- Check `RATE_LIMIT_ENABLED=true` in `.env.local`
- Restart dev server after env changes
- Check console for initialization errors

---

## 🔧 Troubleshooting

### Issue: "Cannot find module 'rate-limiter-flexible'"
**Solution**: Run `npm install rate-limiter-flexible`

### Issue: "RATE_LIMIT_ENABLED is not defined"
**Solution**: Make sure `.env.local` has `RATE_LIMIT_ENABLED=true`

### Issue: "TypeScript errors in rateLimiter.ts"
**Solution**: Run `npm run lint -- --fix` to auto-fix, or update TypeScript types

### Issue: Tests won't run
**Solution**: Check if Jest is configured. May need to add Jest config to package.json:
```json
"jest": {
  "testEnvironment": "node",
  "testMatch": ["**/tests/**/*.test.ts"]
}
```

---

## 📊 Next: Feature 2 Ready

Once Feature 1 validation succeeds, you can start **Feature 2: Realtime Notifications**.

Reference: `IMPLEMENTATION_PLAN.md` → Feature 2 section

---

## 📝 To Document Your Progress:

**Record in your project:**
```markdown
## Feature 1: Rate-Limiting ✅
- Installation: ✅ Complete
- Build Check: ✅ Pass
- Dev Server: ✅ Running
- Manual Tests: ✅ Pass
- Unit Tests: ✅ Pass
- Status: Ready for Feature 2
```

---

**⏱️ Estimated time for these steps: 15-20 minutes**

**📞 If anything breaks, check FEATURE_1_COMPLETE.md for detailed troubleshooting**

---

## 🎉 Ready to Start?

```powershell
# Go to your project directory
cd c:\Users\andyd\Desktop\FYP-NextJS\lost-found-platform

# Install dependencies
npm install

# Start dev server
npm run dev

# You should see rate limiter initialization in console
```

**Proceed when all steps 1-5 are complete!** ✅
