# Vercel Blob Storage Setup Guide

## Overview

Aplikasi Lost & Found Platform menggunakan **Vercel Blob Storage** untuk menyimpan gambar item. Ini lebih efisien dibanding Base64 karena:
- Database MongoDB lebih kecil & cepat
- Gambar di-serve dari CDN global
- Auto-optimized untuk web
- 10GB storage gratis

## Setup untuk Development (Local)

### Step 1: Install Package
```bash
npm install @vercel/blob
```
✅ **Done!** (sudah terinstall)

### Step 2: Dapatkan Blob Token dari Vercel

1. **Login ke Vercel** (https://vercel.com)
2. Pilih project: **lost-found-platform**
3. Go to **Storage** tab
4. Click **"Create Database"** → pilih **"Blob"**
5. Beri nama: `lost-found-images` (atau nama lain)
6. Click **"Create"**

### Step 3: Connect Blob ke Project

Di halaman Blob storage yang baru dibuat:
1. Click **"Connect Project"**
2. Pilih project **lost-found-platform**
3. Click **"Connect"**

Vercel akan otomatis add environment variable `BLOB_READ_WRITE_TOKEN` ke project kamu!

### Step 4: Download Token untuk Local Development

1. Di Vercel Dashboard → Project Settings → **Environment Variables**
2. Cari variable **`BLOB_READ_WRITE_TOKEN`**
3. Copy value-nya
4. Paste ke file `.env.local`:
   ```bash
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
   ```

### Step 5: Test

Restart development server:
```bash
npm run dev
```

Upload gambar di `/items/new` → gambar akan otomatis terupload ke Vercel Blob!

## Cara Kerja

### Before (Base64):
```
User Upload → Convert to Base64 → Save to MongoDB
                                    ↓
                              Database = 70KB/item
```

### After (Vercel Blob):
```
User Upload → Upload to Vercel Blob → Get URL → Save URL to MongoDB
                                                       ↓
                                                 Database = 500 bytes/item
                                                 Images = Vercel CDN
```

## Environment Variables

### Development (.env.local)
```bash
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

### Production (Vercel Dashboard)
Sudah otomatis ter-set saat kamu connect Blob storage ke project!

## Vercel Blob API Usage

### Upload Image
```typescript
import { put } from '@vercel/blob';

const blob = await put(`items/${filename}.jpg`, buffer, {
  access: 'public',
  contentType: 'image/jpeg',
});

console.log(blob.url); // https://xyz.public.blob.vercel-storage.com/items/...
```

### Image URL Format
```
https://[unique-id].public.blob.vercel-storage.com/items/QR123ABC.jpg
```

## Backward Compatibility

Code tetap support Base64 lama:
- Item dengan `image` Base64 string → tetap bisa ditampilkan
- Item baru dengan Vercel Blob → simpan URL
- Smooth migration tanpa breaking changes!

## Free Tier Limits

- **Storage**: 10 GB
- **Bandwidth**: 100 GB/month
- **Requests**: Unlimited

Cukup untuk ribuan gambar!

## Production Deployment

Saat push ke GitHub:
1. Vercel auto-deploy ✅
2. `BLOB_READ_WRITE_TOKEN` sudah ada di production ✅
3. Upload langsung ke Vercel Blob ✅

**No extra setup needed!**

## Monitoring

Cek usage di:
- Vercel Dashboard → Storage → Blob → View Stats
- Lihat:
  - Storage used
  - Bandwidth used
  - Total files

## Troubleshooting

### Error: "BLOB_READ_WRITE_TOKEN not found"
**Solution**: Pastikan token sudah di-set di `.env.local` (local) atau Vercel Dashboard (production)

### Error: "Failed to upload"
**Solution**: 
- Check internet connection
- Verify token masih valid
- Check Vercel Blob dashboard untuk errors

### Gambar tidak muncul
**Solution**:
- Check `image` field di MongoDB berisi URL (bukan Base64)
- Verify URL accessible: buka di browser
- Check browser console untuk CORS errors

## Migration dari Base64

Untuk migrate existing items dengan Base64:
1. Items lama tetap bisa ditampilkan (backward compatible)
2. Optional: Buat script untuk upload Base64 ke Blob & update URL
3. Atau: Biarkan existing items pakai Base64, new items pakai Blob

## Documentation Links

- Vercel Blob Docs: https://vercel.com/docs/storage/vercel-blob
- Vercel Blob SDK: https://github.com/vercel/storage/tree/main/packages/blob

---

**Status**: ✅ Implemented & Ready to Use!
