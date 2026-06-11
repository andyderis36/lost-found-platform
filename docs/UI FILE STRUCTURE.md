# 📂 UI/FRONTEND FILE STRUCTURE - Lost & Found Platform

**Purpose:** Quick reference untuk file-file UI yang perlu diubah saat redesign  
**Last Updated:** December 10, 2025

---

## 🗂️ FOLDER STRUCTURE

lost-found-platform/
│
├── src/
│   ├── app/                          # Next.js 13+ App Router (All UI Pages)
│   │   ├── globals.css              ⭐ Global styles, animations, utilities
│   │   ├── layout.tsx               ⭐ Root layout, fonts, metadata
│   │   ├── page.tsx                 ⭐ Home/Landing page [✅ DONE]
│   │   │
│   │   ├── login/
│   │   │   └── page.tsx             🔐 Login form
│   │   │
│   │   ├── register/
│   │   │   └── page.tsx             🔐 Registration form
│   │   │
│   │   ├── forgot-password/
│   │   │   └── page.tsx             🔐 Forgot password form
│   │   │
│   │   ├── reset-password/
│   │   │   └── page.tsx             🔐 Reset password form
│   │   │
│   │   ├── verify-email/
│   │   │   └── page.tsx             📧 Email verification page
│   │   │
│   │   ├── dashboard/
│   │   │   └── page.tsx             📊 Main dashboard (stats, items list)
│   │   │
│   │   ├── items/
│   │   │   ├── new/
│   │   │   │   └── page.tsx         ➕ Create new item form
│   │   │   └── [id]/
│   │   │       └── page.tsx         📋 Item detail & edit page
│   │   │
│   │   ├── scan/
│   │   │   └── [qrCode]/
│   │   │       └── page.tsx         📱 Public scan page (contact form)
│   │   │
│   │   └── admin/
│   │       ├── page.tsx             👑 Admin dashboard
│   │       ├── users/
│   │       │   └── page.tsx         👥 Users management table
│   │       └── items/
│   │           └── page.tsx         📦 Items management table
│   │
│   └── components/                   # Reusable UI Components
│       ├── Navbar.tsx               ⭐ Global navigation bar
│       └── ImageCropper.tsx         🖼️ Image crop modal
│
└── public/
    └── logos/                        # Logo assets
        ├── logo-black.png           🎨 Logo for light backgrounds
        └── logo-white.png           🎨 Logo for dark backgrounds (future)
```


## 📁 FILE DETAILS

### **🎨 GLOBAL STYLES & LAYOUT**

| File | Path | Purpose | Status |
|------|------|---------|--------|
| **globals.css** | `src/app/globals.css` | Colors, animations, utilities, phone input styles | ✅ Done |
| **layout.tsx** | `src/app/layout.tsx` | Root layout, metadata, fonts | ✅ Done |

---

### **🧩 SHARED COMPONENTS**

| Component | Path | Used In | Purpose | Status |
|-----------|------|---------|---------|--------|
| **Navbar** | `src/components/Navbar.tsx` | All authenticated pages | Global navigation, user menu | ✅ Done |
| **ImageCropper** | `src/components/ImageCropper.tsx` | items/new, items/[id] | Image crop modal | ✅ Done |

---

### **🏠 PUBLIC PAGES** (Unauthenticated)

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| **Home** | `src/app/page.tsx` | Landing page | ✅ Done |
| **Login** | `src/app/login/page.tsx` | Login form | ✅ Done |
| **Register** | `src/app/register/page.tsx` | Registration form | ✅ Done |
| **Forgot Password** | `src/app/forgot-password/page.tsx` | Password reset request | ✅ Done |
| **Reset Password** | `src/app/reset-password/page.tsx` | Password reset form | ✅ Done |

---

### **🔐 USER PAGES** (Authenticated)

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| **Dashboard** | `src/app/dashboard/page.tsx` | Main dashboard, stats cards, items list | ✅ Done |
| **New Item** | `src/app/items/new/page.tsx` | Create item form with image upload | ✅ Done |
| **Item Detail** | `src/app/items/[id]/page.tsx` | View/edit item, QR code, scan history | ✅ Done |
| **Verify Email** | `src/app/verify-email/page.tsx` | Email verification success | ✅ Done |

---

### **📱 PUBLIC SCAN PAGE**

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| **Scan** | `src/app/scan/[qrCode]/page.tsx` | Public item view, contact form | ✅ Done |

---

### **👑 ADMIN PAGES**

| Page | Path | Purpose | Status |
|------|------|---------|--------|
| **Admin Dashboard** | `src/app/admin/page.tsx` | Admin stats, overview | ✅ Done |
| **Users Management** | `src/app/admin/users/page.tsx` | User table, filters, actions | ✅ Done |
| **Items Management** | `src/app/admin/items/page.tsx` | Item table, filters, actions | ✅ Done |

---

## 🎯 REDESIGN PRIORITY

| Priority | Files | Impact | Status |
|----------|-------|--------|--------|
| **P1** 🔥 | `globals.css`, `page.tsx`, `Navbar.tsx` | Global foundation | ✅ Done |
| **P2** 🔥 | `dashboard/page.tsx`, `login/page.tsx`, `register/page.tsx` | Core user flow | ✅ Done |
| **P3** 📌 | `items/new/page.tsx`, `items/[id]/page.tsx` | Item management | ✅ Done |
| **P4** 📋 | `scan/[qrCode]/page.tsx`, forgot/reset password | Secondary flows | ✅ Done |
| **P5** ⚪ | `ImageCropper.tsx`, admin pages, verify-email | Polish & admin | ✅ Done |

---

## 📊 FILE COUNT SUMMARY

- **Total UI Files:** 16 pages + 2 components = **18 files**
- **Completed:** 18 files
- **Remaining:** 0 files
- **Progress:** 100% complete

---

## 🔄 QUICK REFERENCE

**Need to redesign this feature?**

| Feature | File to Edit |
|---------|--------------|
| Colors, animations | `src/app/globals.css` |
| Navigation bar | `src/components/Navbar.tsx` |
| Home page | `src/app/page.tsx` |
| Login screen | `src/app/login/page.tsx` |
| Registration | `src/app/register/page.tsx` |
| User dashboard | `src/app/dashboard/page.tsx` |
| Add item form | `src/app/items/new/page.tsx` |
| Item details | `src/app/items/[id]/page.tsx` |
| QR scan page | `src/app/scan/[qrCode]/page.tsx` |
| Image cropper | `src/components/ImageCropper.tsx` |
| Admin panel | `src/app/admin/page.tsx` |
| User management | `src/app/admin/users/page.tsx` |

---