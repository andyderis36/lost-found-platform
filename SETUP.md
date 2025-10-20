# 🚀 Setup Instructions for Lost & Found Platform

## Step-by-Step Guide

### 1. MongoDB Local Setup (with Compass)

#### Option A: Using Existing MongoDB Installation ✅

**Jika lo udah install MongoDB:**

1. **Check MongoDB Service**
   - Buka Windows Services (`Win + R` → `services.msc`)
   - Cari "MongoDB Server"
   - Pastikan status: **Running**
   - Jika tidak, klik kanan → **Start**

2. **Verify MongoDB is Running**
   
   Buka PowerShell/CMD dan jalankan:
   ```powershell
   # Check if MongoDB is running
   mongosh --eval "db.version()"
   ```
   
   Jika muncul version number, berarti MongoDB udah jalan! ✅

3. **Open MongoDB Compass**
   - Buka MongoDB Compass
   - Connection string default: `mongodb://localhost:27017`
   - Click **Connect**
   - Database akan otomatis dibuat saat pertama kali koneksi dari app

#### Option B: Fresh MongoDB Installation

**Jika belum install MongoDB:**

1. **Download MongoDB Community Server**
   - Go to: https://www.mongodb.com/try/download/community
   - Select: Windows, MSI package
   - Download & Install (pilih "Complete" installation)
   - ✅ Check: Install MongoDB as a Service
   - ✅ Check: Install MongoDB Compass

2. **Verify Installation**
   ```powershell
   mongosh --version
   ```

3. **Start MongoDB Service**
   - Biasanya auto-start setelah install
   - Atau manual start dari Services

#### Using MongoDB Compass

1. **Connect to Local MongoDB**
   - Open MongoDB Compass
   - Connection string: `mongodb://localhost:27017`
   - Click "Connect"

2. **Create Database (Optional)**
   - Setelah connect, klik "Create Database"
   - Database Name: `lost-found-platform`
   - Collection Name: `users` (atau apa aja)
   - Click "Create Database"
   
   **Note:** Database & collections akan otomatis dibuat oleh app!

3. **Browse Data**
   - Setelah app jalan, lo bisa lihat data di Compass
   - Collections: `users`, `items`, `scans`

### 2. Environment Variables Setup

1. Open `.env.local` file in project root
2. Replace the placeholder values:

```env
# MongoDB Local Connection (no username/password needed)
MONGODB_URI=mongodb://localhost:27017/lost-found-platform

# Generate random string for JWT
JWT_SECRET=your-generated-secret-here

# Keep these as is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_QR_BASE_URL=http://localhost:3000/scan
```

**Note:** MongoDB lokal default tanpa authentication, jadi gak perlu username/password!

### 3. Generate JWT Secret

Run this command in terminal to generate secure JWT secret:

**Windows PowerShell:**
```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Mac/Linux:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy the output and paste it as `JWT_SECRET` value.

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### 6. Verify MongoDB Connection

Check your terminal for:
```
✅ MongoDB connected successfully
```

If you see this, you're all set! 🎉

## Common Issues & Solutions

### Issue: "MongooseServerSelectionError"
**Solution:**
- **Check if MongoDB service is running:**
  - Open Services (`Win + R` → `services.msc`)
  - Find "MongoDB Server" → should be **Running**
  - If not, right-click → Start
- **Verify connection string:**
  - Make sure `.env.local` has: `mongodb://localhost:27017/lost-found-platform`
- **Check firewall:**
  - Ensure Windows Firewall tidak block MongoDB (port 27017)
- **Test connection:**
  ```powershell
  mongosh
  ```
  If you can connect via mongosh, then the issue is in your app config

### Issue: "JWT_SECRET not defined"
**Solution:**
- Make sure `.env.local` exists in project root
- Restart development server after changing `.env.local`

### Issue: Module not found errors
**Solution:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port 3000 already in use
**Solution:**
```bash
# Kill process on port 3000 (Windows)
npx kill-port 3000

# Or run on different port
npm run dev -- -p 3001
```

## Next Steps

Once everything is running:

1. ✅ Create authentication API endpoints
2. ✅ Build registration/login pages
3. ✅ Create item registration form
4. ✅ Implement QR code generation
5. ✅ Build QR scanner page
6. ✅ Create dashboard

## Need Help?

- Check MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
- Next.js documentation: https://nextjs.org/docs
- Mongoose documentation: https://mongoosejs.com/docs/

Good luck with your project! 🚀
