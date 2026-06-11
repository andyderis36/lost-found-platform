# 04 - Core Features

This documentation provides an in-depth look at the mechanisms powering the platform's primary features, guiding developers in maintaining and testing them.

## 1. QR Code Generation & Scanning

### Generation
When a user registers a new item, the system automatically:
1. Generates a short, secure, URL-friendly unique ID using the `nanoid` library.
2. Saves this ID in the database as `qrCode`.
3. On the frontend, the `qrcode` library renders an absolute URL string (e.g., `https://lostfoundplatform.me/scan/AbC123XyZ`) into a downloadable QR code image.

### Scanning
1. A finder who scans the QR code is redirected to the dynamic `/scan/[qrCode]` page.
2. This page is public. The finder can view item details (e.g., "Car Keys") without exposing the owner's personal information.
3. The finder is presented with a form to submit contact details (WhatsApp/international phone numbers using `react-phone-number-input`) and event location via the Browser Geolocation API.

## 2. Realtime Notifications (Ably)

The system employs Ably to deliver instantaneous in-app notifications without requiring page reloads.
- **Channel Security**: Every user has a private channel (e.g., `user:12345:notifications`). Only authenticated users can subscribe to their respective channels.
- **Publishing**: When an item is scanned (see the Scanning process), the API Route publishes an event to that user's Ably channel.
- **Persistence**: Alongside the Ably delivery, notifications are persisted in MongoDB to ensure they are not lost when the user refreshes the page (Notification Drawer/Bell Alerts).

## 3. Email System (Resend)

Transactional email delivery is handled by the Resend API.
- **Templates**: Next.js is used to render React components as HTML email templates. A plain text fallback version is also included.
- **Custom Domain**: All emails are dispatched from `noreply@lostfoundplatform.me` to maintain professionalism.
- **Primary Use Cases**: 
  - Email verification (during registration).
  - Password reset (with tokens expiring in 1 hour).
  - Scan Alerts containing direct links to Google Maps and the finder's WhatsApp.

## 4. Image Processing & Compression

The platform processes images on the frontend to conserve bandwidth and storage space:
- **Image Cropper**: Users crop images within the browser using the `ImageCropper.tsx` component.
- **Client-Side Compression**: Images are compressed before being transmitted to the backend (achieving 80-95% size reduction).
- **Cloud Storage**: (In upcoming development phases, compressed images will be uploaded to dedicated cloud storage; currently, the system accommodates compressed base64 uploads or URL links).

## 5. Security Hardening & Rate Limiting

The application implements defense-in-depth security strategies:
- **API Rate Limiting**: Sensitive pathways like auth registers, logins, and password resets are rate-limited on the API layer using the `rate-limiter-flexible` library, preventing denial-of-service and brute force vectors.
- **Stealth Mode Access**: Admin endpoints return `404 Not Found` for unauthorized accounts, preventing endpoint scan discovery.
- **Clean Health Endpoints**: `/api/health` does not leak DB configurations or system credentials.

## 6. Automated Unit Testing

A comprehensive testing suite is established using **Vitest**:
- **Test Scripts**: Developers can execute `npm run test` to verify API logic and validation schemas.
- **Coverage**: Core user operations, including email/password logic and user registration API handlers, are covered by automated unit tests.
