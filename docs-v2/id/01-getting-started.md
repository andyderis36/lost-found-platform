# 01 - Getting Started (Persiapan Awal)

Panduan ini akan membantu Anda mengatur lingkungan pengembangan lokal untuk Lost & Found Platform.

## Prasyarat Sistem

Sebelum memulai, pastikan sistem Anda telah terinstal:
- **Node.js**: Versi 20.x atau lebih baru. Disarankan menggunakan NVM (Node Version Manager).
- **npm**: (Termasuk dalam instalasi Node.js).
- **Git**: Untuk *version control*.
- **MongoDB**: Akun MongoDB Atlas (Cloud) atau *instance* MongoDB lokal.
- **Ably**: Akun Ably untuk fitur notifikasi *realtime*.
- **Resend**: Akun Resend dengan domain terverifikasi untuk pengiriman email.

## Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone <url-repo-ini>
   cd lost-found-platform
   ```

2. **Install Dependencies**
   Proyek ini menggunakan `npm`. Jalankan perintah berikut:
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables**
   Salin file `.env.example` (jika ada) menjadi `.env.local` atau buat file `.env.local` di root proyek. Berikut adalah variabel yang wajib diisi:

   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

   # Authentication (JWT)
   JWT_SECRET=rahasia_jwt_anda_yang_sangat_panjang_dan_aman
   JWT_EXPIRES_IN=7d

   # Next.js App URL (untuk callback email/QR)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Ably (Realtime Notifications)
   ABLY_API_KEY=kunci_api_ably_anda

   # Resend (Email Service)
   RESEND_API_KEY=kunci_api_resend_anda
   EMAIL_FROM=noreply@lostfoundplatform.me
   ```

4. **Menjalankan Development Server**
   Proyek ini menggunakan Turbopack untuk waktu *build* dan *refresh* yang lebih cepat.
   ```bash
   npm run dev
   ```
   Aplikasi akan dapat diakses di `http://localhost:3000`.

## Scripts Utama

- `npm run dev`: Menjalankan server lokal dengan Turbopack.
- `npm run build`: Melakukan *build* aplikasi untuk *production*.
- `npm run start`: Menjalankan server *production* hasil build.
- `npm run lint`: Menjalankan ESLint untuk memeriksa kualitas dan format kode.
