# 02 - Architecture (Arsitektur Sistem)

Dokumen ini menguraikan arsitektur sistem, tumpukan teknologi (*tech stack*), struktur direktori, dan skema basis data dari platform.

## Tech Stack (Tumpukan Teknologi)

Proyek ini dibangun di atas ekosistem JavaScript/TypeScript modern:
- **Framework Utama**: Next.js 16 (App Router dengan Turbopack)
- **Bahasa Pemrograman**: TypeScript (Target ECMAScript modern)
- **Styling**: Tailwind CSS v4 (dengan Shadcn UI)
- **Database**: MongoDB (di Atlas) dengan Mongoose (ODM)
- **Autentikasi**: JWT & Bcrypt.js
- **Validasi Data**: Zod (Runtime & Type Validation)
- **Realtime**: Ably WebSocket (Notifikasi *in-app*)
- **Email**: Resend API
- **Keamanan & Proteksi**: `rate-limiter-flexible` (API rate limiting), Stealth Mode (mengembalikan `404` untuk route admin ilegal), pembersihan info database di health check, dan HttpOnly cookies
- **Unit Testing**: Vitest (Pengujian lokal dengan JSDOM dan React Testing Library)

## Struktur Direktori Utama (`src/`)

Arsitektur aplikasi mengikuti standar Next.js App Router:

```text
src/
├── app/                  # Next.js App Router (Pages, Layouts, API Routes)
│   ├── api/              # Backend API Endpoints (/api/auth, /api/items, dll)
│   ├── admin/            # Halaman Admin Dashboard
│   ├── dashboard/        # Halaman User Dashboard
│   ├── items/            # Halaman Manajemen Item
│   ├── scan/             # Halaman Publik untuk Scan QR (/scan/[qrCode])
│   ├── login/            # Halaman Autentikasi
│   └── page.tsx          # Landing Page Utama
├── components/           # Komponen UI Reusable (Navbar, Modal, ImageCropper)
└── contexts/             # React Context Providers (AuthContext)
```

## Pola Desain (Design Patterns)

1. **Server & Client Components**: Aplikasi memaksimalkan *React Server Components* (RSC) untuk fetching data di sisi server, mengurangi *bundle size* klien. *Client Components* (`"use client"`) digunakan hanya ketika interaktivitas (hooks, event listeners) diperlukan.
2. **API Routes sebagai Micro-services**: Direktori `src/app/api` memisahkan logika *backend* berdasarkan domain fitur (auth, items, scans).
3. **Middleware Security**: Next.js Middleware digunakan untuk memproteksi rute yang memerlukan autentikasi sebelum di-render.

## Skema Database (MongoDB/Mongoose)

Terdapat entitas-entitas utama dalam skema database:

1. **User Schema**: Menyimpan kredensial pengguna, status verifikasi email, dan *role* (User/Admin).
2. **Item Schema**: Entitas utama yang menyimpan detail barang berharga, foto, meta-data khusus, kode QR (*nanoid*), status (Lost/Found/Active), dan ID pemilik (referensi ke User).
3. **Scan History Schema**: Menyimpan log pemindaian QR, koordinat GPS (opsional), informasi penemu (opsional/anonim), dan waktu kejadian.
4. **Notification Schema**: Menyimpan riwayat notifikasi *in-app* yang dikirim melalui Ably agar dapat diambil kembali saat pengguna me-refresh halaman.
