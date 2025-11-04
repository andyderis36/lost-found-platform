**PID154 Final Year Project** - A modern web application that helps reunite lost items with their owners through QR code technology.

## 📋 Overview

Users can register their valuable items and attach QR tags to them. When an item is lost and found by someone, they can scan the QR code to contact the owner anonymously while keeping personal information secure.

## ✨ Features

### 🔐 Authentication & Security
- ✅ **User Registration** - Secure account creation with validation
- ✅ **Email Verification** - Email confirmation required for new users
- ✅ **Secure Login** - JWT-based authentication with role support
- ✅ **Forgot Password** - Password reset via email with token expiry
- ✅ **Password Security** - Bcrypt hashing with strength validation
- ✅ **Role-Based Access** - Admin and user roles with different permissions

### 📦 Item Management
- ✅ **Item Registration** - Register items with details, photos, and custom fields
- ✅ **QR Code Generation** - Automatic unique QR code for each item
- ✅ **QR Code Download** - Download QR codes as images to print
- ✅ **Public QR Page** - Accessible scan pages without login
- ✅ **Image Upload & Compression** - Automatic frontend compression (80-95% reduction)
- ✅ **Custom Fields** - Flexible metadata (IMEI, serial number, etc)
- ✅ **Status Management** - Track item status (active, lost, found, inactive)
- ✅ **Item Categories** - Organized categorization system

### 📱 QR Scanning & Contact
- ✅ **QR Scanner** - Scan lost items to contact owners
- ✅ **Anonymous Contact** - Finders contact owners without exposing personal info
- ✅ **Location Tracking** - GPS coordinates captured with address lookup
- ✅ **Phone Input with Country Code** - International phone number support
- ✅ **Scan History** - Complete scan logs with details and locations
- ✅ **Email Notifications** - Automatic email alerts to owners when items scanned
- ✅ **Action Buttons in Email** - Direct links to Google Maps and WhatsApp

### 📊 Dashboard & Analytics
- ✅ **User Dashboard** - Manage all registered items with statistics
- ✅ **Real-time Statistics** - Track total items, active items, and scans
- ✅ **Search & Filter** - Find items by name, status, and category
- ✅ **Scan Analytics** - View scan history with location and contact details

### 👨‍💼 Admin Panel
- ✅ **Admin Dashboard** - Complete platform overview
- ✅ **User Management** - View, edit, delete users with verification status
- ✅ **Item Management** - Manage all items across users
- ✅ **Advanced Filtering** - Filter by role, verification status, and search
- ✅ **Platform Statistics** - Monitor users, items, scans, and growth

### 📧 Email System
- ✅ **Custom Domain Email** - Professional email (noreply@lostfoundplatform.me)
- ✅ **Email Verification** - Confirmation emails with 24-hour token
- ✅ **Password Reset** - Secure reset emails with 1-hour token
- ✅ **Scan Notifications** - Instant alerts when items are found
- ✅ **HTML Email Templates** - Professional, branded email designs
- ✅ **Plain Text Fallback** - Email compatibility for all clients

### 🎨 UI/UX
- ✅ **Responsive Design** - Mobile-first, works on all devices
- ✅ **Clean Interface** - Modern UI with Tailwind CSS
- ✅ **Loading States** - User feedback during operations
- ✅ **Error Handling** - Clear error messages and validation
- ✅ **Password Strength Indicator** - Visual feedback for password security
- ✅ **Image Cropper** - Crop images before upload (optional)

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.6 (App Router with Turbopack)
- **Language:** TypeScript
- **Database:** MongoDB Atlas + Mongoose ODM
- **Styling:** Tailwind CSS v4
- **Authentication:** JWT (JSON Web Tokens) with bcryptjs
- **Email Service:** Resend API with custom domain (lostfoundplatform.me)
- **DNS:** Namecheap with SPF, DKIM, DMARC records
- **QR Code:** qrcode library + nanoid for unique IDs
- **Phone Input:** react-phone-number-input with country codes
- **Image Processing:** Browser-based canvas compression
- **Geolocation:** Browser Geolocation API with reverse geocoding
- **Deployment:** Vercel (Production: https://www.lostfoundplatform.me/)

## 📁 Project Structure

```
lost-found-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── login/     # Login endpoint
│   │   │   │   ├── register/  # Registration endpoint
│   │   │   │   ├── me/        # Get current user
│   │   │   │   ├── verify-email/ # Email verification
│   │   │   │   ├── forgot-password/ # Request password reset
│   │   │   │   └── reset-password/ # Reset password with token
│   │   │   ├── items/         # Item management endpoints
│   │   │   │   ├── [id]/      # Get/Update/Delete specific item
│   │   │   │   └── route.ts   # List/Create items
│   │   │   ├── scans/         # Scan tracking endpoints
│   │   │   │   └── [itemId]/  # Get scans for item
│   │   │   ├── admin/         # Admin-only endpoints
│   │   │   │   ├── stats/     # Platform statistics
│   │   │   │   ├── users/     # User management
│   │   │   │   └── items/     # Item management
│   │   │   └── health/        # Health check endpoint
│   │   ├── admin/             # Admin pages
│   │   │   ├── page.tsx       # Admin dashboard
│   │   │   ├── users/         # User management page
│   │   │   └── items/         # Item management page
│   │   ├── dashboard/         # User dashboard
│   │   ├── items/             # Item pages
│   │   │   ├── [id]/          # Item detail page
│   │   │   └── new/           # Create new item
│   │   ├── scan/              # QR scan pages
│   │   │   └── [qrCode]/      # Scan result page
│   │   ├── login/             # Login page
│   │   ├── register/          # Registration page
│   │   ├── verify-email/      # Email verification page
│   │   ├── forgot-password/   # Forgot password page
│   │   ├── reset-password/    # Reset password page
│   │   ├── layout.tsx         # Root layout with Navbar
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   ├── Navbar.tsx         # Navigation bar with auth
│   │   └── ImageCropper.tsx   # Image cropping component
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility functions
│   │   ├── mongodb.ts         # MongoDB connection
│   │   ├── auth.ts            # JWT helper functions
│   │   ├── admin.ts           # Admin helper functions
│   │   ├── api.ts             # API helper functions
│   │   ├── email.ts           # Email service with Resend
│   │   ├── qrcode.ts          # QR code generation
│   │   ├── image.ts           # Image utilities
│   │   └── imageCompression.ts # Frontend image compression
│   ├── models/                # Mongoose models
│   │   ├── User.ts           # User model with role
│   │   ├── Item.ts           # Item model
│   │   └── Scan.ts           # Scan log model
│   └── types/                 # TypeScript type definitions
│       └── index.ts           # Shared types
├── public/                    # Static assets
│   └── favicon.ico
├── .env.local                 # Environment variables (git ignored)
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript config
└── next.config.ts             # Next.js config
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (free tier available)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd lost-found-platform
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup MongoDB Atlas**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create a free cluster
   - Get your connection string
   - Whitelist your IP address (or use 0.0.0.0/0 for development)

4. **Configure environment variables**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your MongoDB URI
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/lost-found-platform?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-here
```

5. **Run the development server**
```bash
npm run dev
```

6. **Open your browser**
```
http://localhost:3000
```

## 📊 Database Schema

### Users Collection
```typescript
{
  _id: ObjectId,
  email: string,                    // Unique, indexed
  name: string,
  phone?: string,                   // International format with country code
  passwordHash: string,             // bcrypt hashed
  role: 'user' | 'admin',           // Role-based access control
  emailVerified: boolean,           // Email verification status
  verificationToken?: string,       // Email verification token
  verificationTokenExpires?: Date,  // Token expiry (24 hours)
  resetPasswordToken?: string,      // Password reset token
  resetPasswordExpires?: Date,      // Token expiry (1 hour)
  createdAt: Date,
  updatedAt: Date
}
```

### Items Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  qrCode: string,             // Unique QR identifier (indexed, unique)
  name: string,
  category: enum,             // Electronics, Personal Items, Bags & Luggage, 
                              // Jewelry, Documents, Keys, Sports Equipment, Other
  description?: string,
  image?: string,             // Base64 encoded (compressed by frontend)
  customFields?: object,      // Flexible metadata (IMEI, serial number, etc)
  status: enum,               // active, lost, found, inactive
  createdAt: Date,
  updatedAt: Date
}
```

### Scans Collection
```typescript
{
  _id: ObjectId,
  itemId: ObjectId,           // Reference to Item
  scannerName?: string,       // Finder's name
  scannerEmail?: string,      // Finder's email
  scannerPhone?: string,      // Finder's phone (with country code)
  location?: {
    latitude: number,         // GPS coordinates
    longitude: number,
    address?: string          // Reverse geocoded address
  },
  message?: string,           // Message from finder to owner
  scannedAt: Date            // Timestamp
}
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://<user:pass>@cluster.mongodb.net/lost-found-platform` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-64-char-random-string` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` or `https://www.lostfoundplatform.me` |
| `NEXT_PUBLIC_QR_BASE_URL` | Base URL for QR codes | `http://localhost:3000/scan` or `https://www.lostfoundplatform.me/scan` |
| `RESEND_API_KEY` | Resend API key for emails | `re_xxxxxxxxxxxxxxxxxxxxx` |
| `FROM_EMAIL` | Sender email address | `noreply@lostfoundplatform.me` |
| `DEV_OVERRIDE_EMAIL` | (Dev only) Override email recipient | `your-test-email@gmail.com` |

**Production (Vercel):** Set these in Vercel Dashboard → Settings → Environment Variables

**Email Setup:**
1. Sign up at [Resend.com](https://resend.com)
2. Verify your domain and add DNS records (SPF, DKIM, DMARC)
3. Get API key and add to environment variables
4. For development, use `DEV_OVERRIDE_EMAIL` to redirect all emails to your test address

## 📦 Dependencies

### Production
- `next` (15.5.6) - React framework with App Router
- `react` & `react-dom` (19.x) - UI library
- `mongoose` (8.x) - MongoDB ODM
- `bcryptjs` (2.x) - Password hashing
- `jsonwebtoken` (9.x) - JWT authentication
- `qrcode` (1.x) - QR code generation
- `nanoid` (5.x) - Unique ID generation
- `resend` (4.x) - Email service
- `react-phone-number-input` (3.x) - International phone input
- `crypto` (Node built-in) - Token generation

### Development
- `typescript` (5.x) - Type safety
- `tailwindcss` (4.x) - Utility-first CSS
- `eslint` (9.x) - Code linting
- `@types/*` - TypeScript definitions

## 🎯 Project Status

### ✅ Completed Features

#### Phase 1: Foundation
✅ Project setup with Next.js 15 & TypeScript  
✅ MongoDB Atlas integration  
✅ Database models (User, Item, Scan)  
✅ MongoDB connection with caching  

#### Phase 2: Authentication & Security
✅ User registration with validation  
✅ Email verification system (24-hour token)  
✅ Secure login with JWT  
✅ Password hashing with bcrypt (min 6 characters)  
✅ Forgot password functionality  
✅ Password reset via email (1-hour token)  
✅ Protected routes & middleware  
✅ Auth context for client-side auth state  
✅ Role-based access control (user/admin)  
✅ Email verification required for new users  
✅ Backward compatibility for existing users  

#### Phase 3: Core Features
✅ Item registration with photos  
✅ QR code generation (unique IDs)  
✅ QR code download as image  
✅ Public QR scan page (no login required)  
✅ QR scanner with item lookup  
✅ Anonymous contact form for finders  
✅ Phone input with country code dropdown  
✅ User dashboard with statistics  
✅ Item management (create, edit, delete, status update)  
✅ Custom fields support (flexible metadata)  
✅ Image compression (frontend canvas-based, 80-95% reduction)  
✅ Image cropper component (optional use)  

#### Phase 4: Advanced Features
✅ Location tracking with GPS coordinates  
✅ Reverse geocoding for addresses  
✅ Google Maps integration in emails  
✅ WhatsApp direct contact links  
✅ Scan history with location details  
✅ Email notifications to owners on scan  
✅ Action buttons in emails (View Location, WhatsApp)  
✅ Search & filter items by status/category  
✅ Admin panel with full access  
✅ User management with verification status  
✅ Advanced admin filters (role, verification)  
✅ Platform statistics dashboard  
✅ Reset filters functionality  
✅ Square image thumbnails (1:1 aspect ratio)  

#### Phase 5: Email System
✅ Custom domain email (lostfoundplatform.me)  
✅ Resend email service integration  
✅ DNS configuration (SPF, DKIM, DMARC)  
✅ Email verification templates  
✅ Password reset email templates  
✅ Scan notification email templates  
✅ Professional HTML email design  
✅ Plain text email fallback  
✅ Email deliverability optimization

#### Phase 6: Polish & Deployment
✅ Responsive design (mobile-first)  
✅ Clean UI with Tailwind CSS  
✅ Loading states & error handling  
✅ Password strength indicators  
✅ Form validation feedback  
✅ Deployment to Vercel  
✅ Custom domain setup (www.lostfoundplatform.me)  
✅ Production MongoDB Atlas setup  
✅ Environment variable management  
✅ Email spam prevention guidance  

### 🚧 Future Enhancements

⬜ Real-time updates with WebSockets  
⬜ Push notifications (PWA)  
⬜ Advanced analytics dashboard with charts  
⬜ Export data (CSV/PDF)  
⬜ Multi-language support (i18n)  
⬜ Dark mode toggle  
⬜ PWA support (offline capability)  
⬜ Image optimization with cloud storage (Vercel Blob/Cloudinary)  
⬜ Bulk item import/export  
⬜ QR code customization (colors, logos)  
⬜ Unit & integration tests  
⬜ API rate limiting  
⬜ Two-factor authentication (2FA)  
⬜ Social media sharing  
⬜ Mobile app (React Native)  
⬜ Item insurance integration  
⬜ Reward system for finders  
⬜ Community forum  

## 🚀 Deployment

### Live Application
**Production URL:** https://www.lostfoundplatform.me/  
**Custom Domain:** lostfoundplatform.me (via Namecheap)  
**Email Domain:** noreply@lostfoundplatform.me (via Resend)

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
```bash
git push origin master
```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Configure environment variables (see above)
   - Deploy!

3. **Set Environment Variables in Vercel**
   - Go to Project Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy if needed

### Manual Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Development

### Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm run build
```

### Run Production Build Locally
```bash
npm run build
npm start
```

### Linting
```bash
npm run lint
```

## 📱 Usage Guide

### For Item Owners:
1. **Register** - Create an account with email verification
2. **Verify Email** - Click link in welcome email (check spam folder)
3. **Login** - Access your dashboard
4. **Add Item** - Register your valuable items with photos and details
5. **Download QR Code** - Print and attach to your items
6. **Monitor** - Track scans and manage items from dashboard
7. **Get Notified** - Receive instant email when someone finds your item
8. **Contact Finder** - Use WhatsApp or view location from email

### For Finders:
1. **Scan QR Code** - Use any QR scanner app or camera
2. **View Item Details** - See item information on public page
3. **Fill Contact Form** - Enter your name, email, phone (with country code)
4. **Share Location** - Allow GPS access for location sharing
5. **Add Message** - Write a message to the owner
6. **Submit** - Owner receives instant email notification with your details

### For Admins:
1. **Access Admin Panel** - Navigate to `/admin`
2. **View Statistics** - Monitor users, items, scans, and growth
3. **Manage Users** - View, edit, delete users; check verification status
4. **Filter Users** - By role (admin/user) and verification (verified/unverified)
5. **Manage Items** - View and manage all items across users
6. **Search & Filter** - Find users/items quickly with advanced filters

## 🤝 Contributing

This is a final year project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## � Security Features

### Authentication
- JWT-based authentication with secure token storage
- Password hashing with bcrypt (cost factor 10)
- Email verification required for new accounts
- Password reset with time-limited tokens (1 hour)
- Role-based access control (RBAC)

### Data Protection
- Environment variable management
- Secure MongoDB connection with credentials
- Input validation and sanitization
- Protected API routes with middleware
- XSS prevention with React

### Email Security
- SPF, DKIM, DMARC records configured
- Custom domain email to prevent spoofing
- Token-based verification (crypto.randomBytes)
- Time-limited tokens to prevent abuse
- Development email override for testing

## 📧 Email Features

### Templates Available
1. **Welcome Email** - Sent on registration with verification link
2. **Password Reset** - Sent when user requests password reset
3. **Scan Notification** - Sent to owner when item is scanned

### Email Content
- Professional HTML design with gradient headers
- Plain text fallback for compatibility
- Action buttons (Verify, Reset, View Location, WhatsApp)
- Responsive design for mobile devices
- Branded footer with company info

### Email Deliverability
- Custom domain (lostfoundplatform.me)
- DNS records verified (SPF, DKIM, DMARC)
- Reply-to address configured
- Clear subject lines
- User guidance for spam folders

## 🌐 Domain Configuration

### DNS Records (Namecheap)
```
Type    Host    Value                           TTL
A       @       76.76.21.21                     Automatic
CNAME   www     cname.vercel-dns.com            Automatic
TXT     @       v=spf1 include:_spf.resend.com ~all    Automatic
TXT     resend._domainkey    [DKIM key from Resend]    Automatic
TXT     _dmarc  v=DMARC1; p=quarantine; ...     Automatic
```

### Vercel Configuration
- Domain: www.lostfoundplatform.me
- SSL/TLS: Automatic with Let's Encrypt
- Redirects: lostfoundplatform.me → www.lostfoundplatform.me

## �📝 License

This project is created for academic purposes as part of Final Year Project (PID154).

## 👨‍💻 Author

**SYABANA ANDYDERIS - 296530**  
Final Year IT Student - PID154  
UNIVERSITI UTARA MALAYSIA

## 🙏 Acknowledgments

- **Next.js** - The React Framework for Production
- **MongoDB** - Database solution
- **Vercel** - Hosting and deployment
- **Resend** - Email service provider
- **Namecheap** - Domain registrar
- **Tailwind CSS** - Styling framework

---

**Live Site:** [www.lostfoundplatform.me](https://www.lostfoundplatform.me/)

---
