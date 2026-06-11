# 04 - Core Features (Fitur Inti)

Dokumentasi ini menjelaskan mekanisme di balik fitur-fitur utama platform secara lebih mendalam untuk memandu *developer* dalam memelihara dan menguji fitur.

## 1. QR Code Generation & Scanning

### Pembuatan (Generation)
Ketika pengguna meregistrasikan item baru, sistem secara otomatis akan:
1. Menghasilkan ID unik yang pendek dan aman (*URL-friendly*) menggunakan library `nanoid`.
2. ID ini disimpan di database sebagai `qrCode`.
3. Di sisi *frontend*, library `qrcode` merender *string* URL absolut (contoh: `https://lostfoundplatform.me/scan/AbC123XyZ`) menjadi gambar QR code yang dapat diunduh.

### Pemindaian (Scanning)
1. Penemu yang memindai QR code akan diarahkan ke halaman dinamis `/scan/[qrCode]`.
2. Halaman ini bersifat publik. Penemu dapat melihat detail item (misal: "Kunci Mobil") tanpa melihat informasi pribadi pemilik.
3. Penemu ditawarkan formulir untuk memasukkan kontak (WhatsApp/telepon internasional menggunakan `react-phone-number-input`) dan lokasi kejadian via Browser Geolocation API.

## 2. Realtime Notifications (Ably)

Sistem menggunakan Ably untuk mengirimkan notifikasi *in-app* secara instan tanpa perlu memuat ulang halaman (*refresh*).
- **Channel Security**: Setiap pengguna memiliki *channel* privat (misal: `user:12345:notifications`). Hanya pengguna yang terautentikasi yang dapat mendengarkan (*subscribe*) ke *channel* miliknya.
- **Publishing**: Ketika item dipindai (lihat proses *Scanning*), API Route mem-publish *event* ke *channel* Ably milik pengguna tersebut.
- **Persistence**: Selain dikirim ke Ably, notifikasi juga disimpan ke MongoDB agar tidak hilang saat pengguna me-refresh halaman (Notification Drawer/Bell Alerts).

## 3. Sistem Email (Resend)

Pengiriman email transaksional ditangani oleh API Resend.
- **Templates**: Next.js digunakan untuk merender komponen React sebagai template HTML email. Terdapat versi *fallback plain text*.
- **Domain Kustom**: Semua email dikirim dari `noreply@lostfoundplatform.me` untuk menjaga profesionalitas.
- **Use Cases Utama**: 
  - Verifikasi email (saat registrasi).
  - Lupa password (dengan token yang memiliki *expiry time* 1 jam).
  - Peringatan pemindaian (Scan Alerts) yang berisi tautan langsung ke Google Maps dan WhatsApp penemu.

## 4. Image Processing & Compression

Platform ini memproses gambar di sisi *frontend* untuk menghemat biaya *bandwidth* dan ruang penyimpanan:
- **Image Cropper**: Pengguna memotong (crop) gambar di *browser* menggunakan komponen `ImageCropper.tsx`.
- **Kompresi Klien**: Gambar dikompresi sebelum dikirim ke *backend* (mengurangi ukuran hingga 80-95%).
- **Cloud Storage**: (Dalam pengembangan tahap selanjutnya, gambar yang dikompresi akan diunggah ke *cloud storage* khusus, saat ini sistem mengakomodasi upload *base64* terkompresi atau tautan URL).

## 5. Keamanan & Rate Limiting (Security Hardening)

Aplikasi menerapkan strategi keamanan berlapis (*defense-in-depth*):
- **API Rate Limiting**: Alur sensitif seperti registrasi akun, login, dan reset password dilindungi di layer API menggunakan pustaka `rate-limiter-flexible` untuk mencegah brute force dan DDoS.
- **Stealth Mode Access**: Endpoint admin mengembalikan `404 Not Found` untuk akun non-admin guna mencegah pemindaian endpoint admin ilegal.
- **Health Check Aman**: `/api/health` dibersihkan dari detail teknis (seperti nama database atau teknologi database) agar terhindar dari kebocoran informasi.

## 6. Pengujian Unit Otomatis (Automated Testing)

Sistem pengujian unit diimplementasikan menggunakan framework **Vitest**:
- **Script Pengujian**: Developer dapat menjalankan `npm run test` untuk memverifikasi logika API dan skema validasi Zod secara instan.
- **Cakupan Pengujian**: Alur autentikasi inti seperti pendaftaran akun, validasi email/password, dan API handler (`src/app/api/auth/register/route.test.ts`) dilindungi oleh pengujian unit otomatis.
