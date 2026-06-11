# 🔍 Lost & Found Platform with QR Tags

**PID154 Final Year Project** - A modern web application that helps reunite lost items with their owners through QR code technology.

## 📋 Overview

Users can register their valuable items and attach QR tags to them. When an item is lost and found by someone, they can scan the QR code to contact the owner anonymously while keeping personal information secure.

## ✨ Features

- 🔐 **User Authentication** - Secure registration and login
- 📦 **Item Registration** - Register items with details, photos, and custom fields
- 🔲 **QR Code Generation** - Automatic unique QR code for each item
- 📱 **QR Scanner** - Scan lost items to contact owners
- 📊 **Dashboard** - Manage all registered items
- 📍 **Location Tracking** - Track where items were scanned
- 💬 **Anonymous Contact** - Finders can contact owners without exposing personal info
- 📈 **Scan History** - View all scans for each item

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** MongoDB + Mongoose
- **Styling:** Tailwind CSS v4
- **Authentication:** JWT (JSON Web Tokens)
- **QR Code:** qrcode library
- **Deployment:** Vercel (recommended)

## 📁 Project Structure

```
lost-found-platform/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── auth/          # Authentication endpoints
│   │   │   ├── items/         # Item management endpoints
│   │   │   └── scans/         # Scan tracking endpoints
│   │   ├── layout.tsx         # Root layout
│   │   └── page.tsx           # Home page
│   ├── components/            # React components
│   ├── lib/                   # Utility functions
│   │   └── mongodb.ts         # MongoDB connection
│   ├── models/                # Mongoose models
│   │   ├── User.ts           # User model
│   │   ├── Item.ts           # Item model
│   │   └── Scan.ts           # Scan log model
│   └── types/                 # TypeScript type definitions
├── public/                    # Static assets
└── .env.local                 # Environment variables
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
  email: string,
  name: string,
  phone?: string,
  passwordHash: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Items Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId,           // Reference to User
  qrCode: string,             // Unique QR identifier
  name: string,
  category: enum,             // electronics, accessories, documents, etc
  description?: string,
  image?: string,
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
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://...` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-secret-key` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `http://localhost:3000` |
| `NEXT_PUBLIC_QR_BASE_URL` | Base URL for QR codes | `http://localhost:3000/scan` |

## 📦 Dependencies

### Production
- `next` - React framework
- `react` & `react-dom` - UI library
- `mongoose` - MongoDB ODM
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `qrcode` - QR code generation
- `nanoid` - Unique ID generation

### Development
- `typescript` - Type safety
- `tailwindcss` - Styling
- `eslint` - Code linting

## 🎯 Roadmap

### Phase 1: MVP (Current)
- [x] Project setup
- [x] Database models
- [x] MongoDB connection
- [ ] Authentication API
- [ ] Item registration
- [ ] QR code generation
- [ ] Basic UI

### Phase 2: Core Features
- [ ] QR scanner page
- [ ] Contact form for finders
- [ ] Email notifications
- [ ] User dashboard
- [ ] Item management (edit/delete)

### Phase 3: Advanced Features
- [ ] Image upload (Cloudinary/AWS S3)
- [ ] Location tracking with maps
- [ ] Search & filter items
- [ ] Admin panel
- [ ] Analytics dashboard

### Phase 4: Polish
- [ ] Responsive design
- [ ] Dark mode
- [ ] PWA support
- [ ] Unit tests
- [ ] Documentation

## 🤝 Contributing

This is a final year project. Contributions, suggestions, and feedback are welcome!

## 📝 License

This project is created for academic purposes.

## 👨‍💻 Author

**SYABANA ANDYDERIS - 296530**
- Final Year IT Student - PID154

---

**Happy Coding! 🚀**
