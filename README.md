**PID154 Final Year Project** - A modern web application that helps reunite lost items with their owners through QR code technology.

## 📋 Overview

Users can register their valuable items and attach QR tags to them. When an item is lost and found by someone, they can scan the QR code to contact the owner anonymously while keeping personal information secure.

## ✨ Features

- ✅ **User Authentication** - Secure registration and login with JWT
- ✅ **Item Registration** - Register items with details, photos, and custom fields
- ✅ **QR Code Generation** - Automatic unique QR code for each item
- ✅ **QR Scanner** - Scan lost items to contact owners
- ✅ **Dashboard** - Manage all registered items with statistics
- ✅ **Location Tracking** - Track where items were scanned with GPS
- ✅ **Anonymous Contact** - Finders can contact owners without exposing personal info
- ✅ **Scan History** - View all scans for each item with details
- ✅ **Image Compression** - Automatic frontend image compression for optimal storage
- ✅ **Admin Panel** - Complete admin dashboard for user and item management
- ✅ **Role-Based Access** - Admin and user roles with different permissions
- ✅ **Responsive Design** - Mobile-friendly interface with optimized layouts

## 🛠️ Tech Stack

- **Framework:** Next.js 15.5.6 (App Router with Turbopack)
- **Language:** TypeScript
- **Database:** MongoDB Atlas + Mongoose ODM
- **Styling:** Tailwind CSS v4
- **Authentication:** JWT (JSON Web Tokens) with bcryptjs
- **QR Code:** qrcode library + nanoid for unique IDs
- **Image Processing:** Browser-based canvas compression
- **Deployment:** Vercel (Production: https://lost-found-platform-virid.vercel.app/)

## 📁 Project Structure

```
lost-found-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   │   ├── login/     # Login endpoint
│   │   │   │   ├── register/  # Registration endpoint
│   │   │   │   └── me/        # Get current user
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
│   │   ├── layout.tsx         # Root layout with Navbar
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   │   └── Navbar.tsx         # Navigation bar with auth
│   ├── contexts/              # React contexts
│   │   └── AuthContext.tsx    # Authentication context
│   ├── lib/                   # Utility functions
│   │   ├── mongodb.ts         # MongoDB connection
│   │   ├── auth.ts            # JWT helper functions
│   │   ├── admin.ts           # Admin helper functions
│   │   ├── api.ts             # API helper functions
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
  email: string,              // Unique, indexed
  name: string,
  phone?: string,
  passwordHash: string,       // bcrypt hashed
  role: 'user' | 'admin',     // Role-based access control
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
  scannerName?: string,
  scannerEmail?: string,
  scannerPhone?: string,
  location?: {
    latitude: number,
    longitude: number,
    address?: string
  },
  message?: string,
  scannedAt: Date
}
```

## 🔑 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/lost-found-platform` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-64-char-random-string` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` or `https://your-domain.vercel.app` |
| `NEXT_PUBLIC_QR_BASE_URL` | Base URL for QR codes | `http://localhost:3000/scan` or `https://your-domain.vercel.app/scan` |

**Production (Vercel):** Set these in Vercel Dashboard → Settings → Environment Variables

## 📦 Dependencies

### Production
- `next` (15.5.6) - React framework with App Router
- `react` & `react-dom` (19.x) - UI library
- `mongoose` (8.x) - MongoDB ODM
- `bcryptjs` (2.x) - Password hashing
- `jsonwebtoken` (9.x) - JWT authentication
- `qrcode` (1.x) - QR code generation
- `nanoid` (5.x) - Unique ID generation

### Development
- `typescript` (5.x) - Type safety
- `tailwindcss` (4.x) - Utility-first CSS
- `eslint` (9.x) - Code linting
- `@types/*` - TypeScript definitions

## 🎯 Project Status

### ✅ Completed Features

#### Phase 1: Foundation
- [x] Project setup with Next.js 15 & TypeScript
- [x] MongoDB Atlas integration
- [x] Database models (User, Item, Scan)
- [x] MongoDB connection with caching

#### Phase 2: Authentication
- [x] User registration with validation
- [x] Secure login with JWT
- [x] Password hashing with bcrypt
- [x] Protected routes & middleware
- [x] Auth context for client-side auth state
- [x] Role-based access control (user/admin)

#### Phase 3: Core Features
- [x] Item registration with photos
- [x] QR code generation (unique IDs)
- [x] QR scanner page with item lookup
- [x] Anonymous contact form for finders
- [x] User dashboard with statistics
- [x] Item management (create, edit, delete, status update)
- [x] Custom fields support (flexible metadata)
- [x] Image compression (frontend canvas-based, 80-95% reduction)

#### Phase 4: Advanced Features
- [x] Location tracking with GPS coordinates
- [x] Scan history with details
- [x] Search & filter items by status/category
- [x] Admin panel with full access
- [x] User management (admin only)
- [x] Platform statistics dashboard
- [x] Square image thumbnails (1:1 aspect ratio)

#### Phase 5: Polish
- [x] Responsive design (mobile-first)
- [x] Clean UI with Tailwind CSS
- [x] Loading states & error handling
- [x] Toast notifications
- [x] Deployment to Vercel
- [x] Production MongoDB Atlas setup
- [x] Environment variable management

### 🚧 Future Enhancements

- [ ] Email notifications for scans
- [ ] Real-time updates with WebSockets
- [ ] Advanced analytics dashboard
- [ ] Multi-language support (i18n)
- [ ] Dark mode toggle
- [ ] PWA support (offline capability)
- [ ] Image optimization with cloud storage (Vercel Blob/Cloudinary)
- [ ] Unit & integration tests
- [ ] API rate limiting
- [ ] Two-factor authentication (2FA)

## 🚀 Deployment

### Live Application
**Production URL:** https://lost-found-platform-virid.vercel.app/

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
1. **Register/Login** - Create an account
2. **Add Item** - Register your valuable items with photos
3. **Download QR Code** - Print and attach to your items
4. **Monitor** - Track scans and manage items from dashboard

### For Finders:
1. **Scan QR Code** - Use any QR scanner app
2. **View Item Details** - See item information
3. **Contact Owner** - Fill anonymous contact form
4. **Submit** - Owner will receive your message with location

### For Admins:
1. **Access Admin Panel** - Navigate to `/admin`
2. **View Statistics** - Monitor platform usage
3. **Manage Users** - View and manage user accounts
4. **Manage Items** - View and manage all items across users

## 🤝 Contributing

This is a final year project. Contributions, suggestions, and feedback are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is created for academic purposes.

## 👨‍💻 Author

**SYABANA ANDYDERIS - 296530** | Final Year IT Student - PID154

---

**Happy Coding! 🚀**
