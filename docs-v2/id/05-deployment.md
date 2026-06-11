# 05 - Deployment & Operations

Proyek ini telah dikonfigurasi untuk *deployment* otomatis (CI/CD) ke Vercel dan menggunakan layanan *cloud-native* untuk semua dependensi eksternalnya.

## Platform Deployment Utama: Vercel

Vercel adalah platform *hosting* yang optimal untuk Next.js. Proyek ini (`https://www.lostfoundplatform.me/`) dihubungkan langsung ke *repository* utama.

### Alur CI/CD
1. **Push ke branch `main`**: Vercel secara otomatis mendeteksi perubahan.
2. **Build Process**: Vercel menjalankan perintah `npm run build` yang melibatkan `next build --turbopack`.
3. **Linting & Type Checking**: ESLint 9 (Flat Config) berjalan selama *build* untuk memastikan tidak ada kesalahan fatal. Build akan gagal jika terdapat *linting error*.
4. **Deploy**: Jika *build* sukses, sistem akan langsung di-deploy ke URL *production*.

### Environment Variables di Vercel
Pastikan seluruh variabel yang ada di `.env.local` telah diisi di pengaturan proyek Vercel (*Settings* -> *Environment Variables*):
- Kredensial MongoDB.
- API Key Ably dan Resend.
- `JWT_SECRET` yang sangat kuat.
- `NEXT_PUBLIC_APP_URL` diset ke domain *production* (`https://www.lostfoundplatform.me`).

## Operasional Database (MongoDB Atlas)

- **Koneksi**: Menggunakan koneksi *pool* standar dari Mongoose yang dikelola melalui utilitas *singleton* untuk mencegah kebocoran koneksi di lingkungan *Serverless* Next.js.
- **Index**: Pastikan *field* yang sering dicari, seperti `email` pada koleksi *User* dan `qrCode` pada koleksi *Item*, memiliki *index* di Atlas untuk performa maksimal.

## Observabilitas & Pemantauan (Monitoring)

Proyek ini telah mengintegrasikan metrik kinerja dan analitik dari Vercel:
1. **@vercel/analytics**: Melacak jumlah kunjungan halaman secara agregat.
2. **@vercel/speed-insights**: Memantau metrik *Core Web Vitals* (LCP, FID, CLS) secara langsung dari peramban pengguna akhir (*real-user metrics*).

## Panduan Perawatan Lanjutan

- Secara berkala, perbarui dependensi di `package.json` menggunakan `npm outdated` dan `npm update`.
- Karena ini menggunakan Next.js 16+, pastikan setiap integrasi eksternal (terutama pustaka lama) kompatibel dengan *React Server Components*.
