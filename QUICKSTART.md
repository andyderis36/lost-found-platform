# 🚀 Quick Start Guide

## Get Your Lost & Found Platform Running in 2 Minutes!

### ✅ Prerequisites Check
Before starting, ensure you have:
- ✅ Node.js 18+ installed
- ✅ MongoDB running (Windows Service should be active)
- ✅ Project files downloaded

---

## 🎯 Start the Application

### Option 1: First Time Setup
```powershell
# Navigate to project folder
cd c:\Users\andyd\Desktop\FYP-NextJS\lost-found-platform

# Install dependencies (only needed once)
npm install

# Start development server
npm run dev
```

### Option 2: Already Setup
```powershell
# Just start the server
npm run dev
```

**Your app will be running at:** http://localhost:3000

---

## 🎮 Test the Complete Flow

### 1️⃣ Register a New Account (30 seconds)
1. Open http://localhost:3000
2. Click **"Get Started Free"** or **"Register"**
3. Fill in the form:
   - Name: Your Name
   - Email: test@example.com
   - Password: password123
   - Phone: (optional)
4. Click **"Create Account"**
5. You'll be auto-logged in and redirected to Dashboard!

### 2️⃣ Add Your First Item (1 minute)
1. In Dashboard, click **"+ Add New Item"**
2. Fill in the form:
   - **Name:** iPhone 15 Pro (or any item)
   - **Category:** Electronics
   - **Description:** Space Black, 256GB, has a small scratch on back
   - **Image URL:** (optional) https://example.com/iphone.jpg
3. *(Optional)* Click **"+ Add Field"** to add custom details:
   - Serial Number: ABC123XYZ
   - Purchase Date: 2024-01-15
4. Click **"Create Item & Generate QR Code"**
5. 🎉 Your QR code is generated instantly!

### 3️⃣ Download QR Code (10 seconds)
1. On the Item Detail page, you'll see a large QR code
2. Click **"📥 Download QR Code"** button
3. A PNG file will be downloaded (LF-XXXXXXXXXX.png)
4. Print this and attach it to your item!

### 4️⃣ Test the Scan Page (30 seconds)
1. Copy the QR code from the item detail page (e.g., `LF-qSrvdPRfBE`)
2. Open a new browser tab (or use incognito mode to simulate a finder)
3. Go to: `http://localhost:3000/scan/LF-qSrvdPRfBE` (replace with your code)
4. You'll see the public scan page with item details!
5. Fill in the "Found This Item?" form:
   - Name: John Finder
   - Email: john@example.com
   - Phone: +1 234 567 8900
   - Location: Central Park, NYC
   - Notes: Found near the fountain
6. Click **"Submit & Contact Owner"**
7. Success! The scan is logged!

### 5️⃣ View Scan History (10 seconds)
1. Go back to your Dashboard
2. Click on your item
3. Scroll down to **"Scan History"** section
4. You'll see John Finder's information!
5. Now you can contact them to get your item back! 🎉

---

## 📱 All Available Pages

| URL | What You'll See |
|-----|----------------|
| `http://localhost:3000/` | Homepage with hero section |
| `http://localhost:3000/register` | Create new account |
| `http://localhost:3000/login` | Login to existing account |
| `http://localhost:3000/dashboard` | Your items dashboard |
| `http://localhost:3000/items/new` | Add new item form |
| `http://localhost:3000/items/[id]` | Item details (replace [id] with actual ID) |
| `http://localhost:3000/scan/[qrCode]` | Public scan page (replace [qrCode] with actual code) |

---

## 🎨 Features to Try

### Dashboard Features
- ✅ Filter items by status (All, Active, Found, Inactive)
- ✅ View total item count in stats cards
- ✅ Quick delete items with confirmation
- ✅ Navigate to item details

### Item Management
- ✅ Edit item status (Active → Found → Inactive)
- ✅ Add custom fields dynamically
- ✅ Delete items with confirmation
- ✅ Download QR codes

### Authentication
- ✅ Logout from navbar
- ✅ Auto-redirect to login if not authenticated
- ✅ Token persists across page refreshes

---

## 🔧 Troubleshooting

### MongoDB Not Running
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB
```

### Port 3000 Already in Use
```powershell
# Kill the process using port 3000
npx kill-port 3000

# Or use a different port
npm run dev -- -p 3001
```

### Clear Browser Cache
If you see old data:
1. Open DevTools (F12)
2. Right-click refresh button
3. Select "Empty Cache and Hard Reload"

### Reset Database
If you want to start fresh:
```powershell
# Connect to MongoDB
mongosh

# Switch to database
use lost-found-platform

# Drop all collections
db.users.deleteMany({})
db.items.deleteMany({})
db.scans.deleteMany({})

# Exit
exit
```

---

## 📊 Expected Behavior

### ✅ What Should Work
- Registration and login
- Creating items with auto QR generation
- Downloading QR codes as PNG
- Filtering items in dashboard
- Editing item status
- Deleting items
- Scanning QR codes (public access)
- Logging scans
- Viewing scan history

### ⚠️ Known Limitations
- No email notifications (would need SendGrid/SMTP)
- No image upload to cloud (would need Cloudinary/S3)
- QR codes are data URLs (not using Next.js Image optimization)

---

## 🎯 Quick Testing Checklist

Use this to verify everything works:

- [ ] Homepage loads
- [ ] Can register new account
- [ ] Can login with credentials
- [ ] Redirected to dashboard after login
- [ ] Can see empty state in dashboard
- [ ] Can add new item
- [ ] QR code appears on item detail page
- [ ] Can download QR code as PNG
- [ ] Public scan page works without login
- [ ] Can submit finder form
- [ ] Scan appears in item's scan history
- [ ] Can edit item status
- [ ] Can delete item
- [ ] Can logout
- [ ] Navbar shows correct options

---

## 📞 Need Help?

### Check These Files for Reference:
- **API Documentation:** `AUTH_API.md`, `ITEMS_API.md`, `API_TESTING.md`
- **Architecture:** `ARCHITECTURE.md`
- **Setup Guide:** `SETUP.md`
- **Project Status:** `FINAL_STATUS.md`

### Common Issues:
1. **"Cannot connect to database"** → Start MongoDB service
2. **"Port already in use"** → Kill port 3000 or use different port
3. **"Unauthorized"** → Login again or clear localStorage
4. **"QR code not found"** → Make sure you're using the correct QR code

---

## 🎉 Success Indicators

You know it's working when:
- ✅ You can register and login
- ✅ Dashboard shows your items
- ✅ QR codes are generated automatically
- ✅ You can download QR PNG files
- ✅ Public scan page loads without login
- ✅ Scan logs appear in history

---

**🎊 Congratulations! Your Lost & Found Platform is now running!**

**Next Step:** Register an account and add your first item! 🚀
