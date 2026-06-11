# 03 - API Reference (Referensi API)

Aplikasi ini menggunakan Next.js Route Handlers (`src/app/api/`) sebagai *backend*. Dokumentasi ini mencakup *endpoint* yang paling penting.

## Konvensi Standar

- **Base URL**: `/api`
- **Format Data**: `application/json`
- **Autentikasi**: *Bearer Token* di *header* otorisasi (`Authorization: Bearer <token>`) atau disimpan di dalam *cookies* untuk sesi Next.js.
- **Validasi**: Semua *payload* tervalidasi menggunakan skema Zod sebelum diproses.
- **Rate Limiting**: Endpoint autentikasi diproteksi dengan rate limiter (`rate-limiter-flexible`) untuk membatasi traffic request dan brute force.
- **Stealth Mode**: Endpoint admin menyembunyikan eksistensinya dengan mengembalikan status `404 Not Found` bagi pengguna non-admin (ilegal).

---

## Modul Autentikasi (`/api/auth/*`)

### 1. Registrasi Pengguna
- **Endpoint**: `POST /api/auth/register`
- **Payload**: `{ email, password, name }`
- **Aksi**: Menyimpan *hash* password (Bcrypt), membuat *record* pengguna, dan mengirim email verifikasi.

### 2. Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email, role } }`
- **Aksi**: Memverifikasi kredensial dan menerbitkan JWT token.

### 3. Get Current User
- **Endpoint**: `GET /api/auth/me`
- **Headers**: Membutuhkan Autentikasi.
- **Aksi**: Mengembalikan profil pengguna yang sedang login berdasarkan token.

---

## Modul Item (`/api/items/*`)

### 1. Daftar Item Milik Sendiri
- **Endpoint**: `GET /api/items`
- **Headers**: Membutuhkan Autentikasi (User/Admin).
- **Aksi**: Menampilkan semua item yang diregistrasikan oleh pengguna terkait.

### 2. Membuat Item Baru
- **Endpoint**: `POST /api/items`
- **Headers**: Membutuhkan Autentikasi.
- **Payload**: `{ name, category, description, customFields, image }`
- **Aksi**: Menghasilkan QR code unik (`nanoid`), menyimpan data gambar yang terkompresi, dan membuat entitas Item.

### 3. Memperbarui Status Item
- **Endpoint**: `PATCH /api/items/[id]`
- **Headers**: Membutuhkan Autentikasi.
- **Payload**: `{ status: 'Lost' | 'Found' | 'Active' | 'Inactive' }`

---

## Modul Pemindaian & Notifikasi (`/api/scans/*`)

### 1. Mencatat Pemindaian QR
- **Endpoint**: `POST /api/scans/[qrCode]`
- **Akses**: Publik (Tidak memerlukan autentikasi).
- **Payload**: `{ location?, contactDetails?, message? }`
- **Aksi**: 
  1. Merekam *history* pemindaian.
  2. Memicu pengiriman notifikasi *realtime* via Ably ke channel pemilik item.
  3. Memicu pengiriman email pemberitahuan via Resend.

---

## Modul Admin (`/api/admin/*`)

### 1. Statistik Platform
- **Endpoint**: `GET /api/admin/stats`
- **Headers**: Membutuhkan Autentikasi (Admin Role).
- **Aksi**: Mengembalikan total pengguna, total item terdaftar, dan metrik aplikasi lainnya.
- **Keamanan**: Stealth Mode aktif (mengembalikan `404 Not Found` bagi pengguna non-admin).

### 2. Manajemen Pengguna
- **Endpoint**: `GET /api/admin/users`
- **Headers**: Membutuhkan Autentikasi (Admin Role).
- **Aksi**: Mengembalikan daftar seluruh pengguna platform.
- **Keamanan**: Stealth Mode aktif.

### 3. Manajemen Item
- **Endpoint**: `GET /api/admin/items`
- **Headers**: Membutuhkan Autentikasi (Admin Role).
- **Aksi**: Mengembalikan daftar seluruh item terdaftar.
- **Keamanan**: Stealth Mode aktif.

---

## Endpoint Utilitas (Utility)

### 1. Health Check (Cek Kesehatan Sistem)
- **Endpoint**: `GET /api/health`
- **Akses**: Publik
- **Respons**: `{ status: "ok", timestamp: "..." }`
- **Keamanan**: Mengembalikan status operasional bersih tanpa membocorkan kredensial database maupun detail sistem (information exposure prevention).
