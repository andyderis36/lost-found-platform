# 📦 Items API Documentation

## Overview

The Items API allows authenticated users to manage their items with automatic QR code generation for each item.

---

## Endpoints

### 1. Create Item
**POST** `/api/items` 🔒 Protected

Create a new item with automatic QR code generation.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "MacBook Pro 14",
  "category": "electronics",
  "description": "Silver MacBook Pro 14 inch, M3 chip",
  "image": "https://example.com/image.jpg",
  "customFields": {
    "brand": "Apple",
    "serialNumber": "C02ABC123XYZ",
    "color": "Silver",
    "purchaseDate": "2024-01-15"
  }
}
```

**Required Fields:**
- `name` (string, 2-100 chars)
- `category` (enum)

**Optional Fields:**
- `description` (string, max 500 chars)
- `image` (string, URL)
- `customFields` (object, flexible metadata)

**Valid Categories:**
- `electronics`
- `accessories`
- `documents`
- `keys`
- `bags`
- `jewelry`
- `other`

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Item created successfully",
  "data": {
    "id": "67...",
    "qrCode": "LF-x9K2mP5nQ7",
    "name": "MacBook Pro 14",
    "category": "electronics",
    "description": "Silver MacBook Pro 14 inch, M3 chip",
    "image": "https://example.com/image.jpg",
    "customFields": {
      "brand": "Apple",
      "serialNumber": "C02ABC123XYZ"
    },
    "status": "active",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

---

### 2. Get All Items
**GET** `/api/items` 🔒 Protected

Get all items for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` (optional) - Filter by status: `active`, `lost`, `found`, `inactive`
- `category` (optional) - Filter by category

**Examples:**
```
GET /api/items
GET /api/items?status=active
GET /api/items?category=electronics
GET /api/items?status=lost&category=accessories
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "67...",
        "qrCode": "LF-x9K2mP5nQ7",
        "name": "MacBook Pro 14",
        "category": "electronics",
        "description": "Silver MacBook Pro 14 inch",
        "image": "https://example.com/image.jpg",
        "customFields": {},
        "status": "active",
        "createdAt": "2025-10-20T...",
        "updatedAt": "2025-10-20T..."
      }
    ],
    "total": 1
  }
}
```

---

### 3. Get Single Item
**GET** `/api/items/:id` 🔒 Protected

Get details of a specific item with QR code data URL.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "67...",
    "qrCode": "LF-x9K2mP5nQ7",
    "name": "MacBook Pro 14",
    "category": "electronics",
    "description": "Silver MacBook Pro 14 inch",
    "image": "https://example.com/image.jpg",
    "customFields": {
      "brand": "Apple",
      "serialNumber": "C02ABC123XYZ"
    },
    "status": "active",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgo...",
    "createdAt": "2025-10-20T...",
    "updatedAt": "2025-10-20T..."
  }
}
```

---

### 4. Update Item
**PUT** `/api/items/:id` 🔒 Protected

Update item details. All fields are optional.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "MacBook Pro 14 Updated",
  "description": "New description",
  "status": "lost",
  "customFields": {
    "notes": "Found at coffee shop"
  }
}
```

**Updatable Fields:**
- `name` (string)
- `category` (enum)
- `description` (string)
- `image` (string)
- `customFields` (object)
- `status` (enum: `active`, `lost`, `found`, `inactive`)

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item updated successfully",
  "data": {
    "id": "67...",
    "qrCode": "LF-x9K2mP5nQ7",
    "name": "MacBook Pro 14 Updated",
    "status": "lost",
    ...
  }
}
```

---

### 5. Delete Item
**DELETE** `/api/items/:id` 🔒 Protected

Permanently delete an item.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Item deleted successfully",
  "data": {
    "id": "67..."
  }
}
```

---

### 6. Download QR Code
**GET** `/api/items/:id/qr` 🔒 Protected

Download QR code as PNG image file.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
- Content-Type: `image/png`
- Content-Disposition: `attachment; filename="LF-x9K2mP5nQ7.png"`
- Binary PNG image data

**Usage:**
```html
<!-- Display QR code image -->
<img src="/api/items/67.../qr" alt="QR Code" />

<!-- Download QR code -->
<a href="/api/items/67.../qr" download>Download QR Code</a>
```

---

## Item Status Flow

```
┌─────────┐
│ active  │  → Item is active and not lost
└─────────┘
     │
     ▼
┌─────────┐
│  lost   │  → Owner marked item as lost
└─────────┘
     │
     ▼
┌─────────┐
│  found  │  → Item has been found/recovered
└─────────┘
     │
     ▼
┌──────────┐
│ inactive │  → Item is deactivated (optional)
└──────────┘
```

---

## QR Code Details

### Format
- **ID Pattern:** `LF-XXXXXXXXXX` (10 random characters)
- **Scan URL:** `{BASE_URL}/scan/{qrCode}`
- **Example:** `http://localhost:3000/scan/LF-x9K2mP5nQ7`

### QR Code Image
- **Size:** 300x300 pixels
- **Format:** PNG
- **Margin:** 2 units
- **Colors:** Black on white

### Data URL
Base64-encoded PNG image for direct embedding:
```html
<img src="data:image/png;base64,iVBORw0KGgo..." />
```

---

## Custom Fields

Custom fields allow flexible metadata for different item types:

### Examples:

**Electronics:**
```json
{
  "brand": "Apple",
  "model": "iPhone 15 Pro",
  "serialNumber": "ABC123XYZ",
  "imei": "123456789012345",
  "color": "Natural Titanium"
}
```

**Documents:**
```json
{
  "type": "Passport",
  "documentNumber": "A12345678",
  "expiryDate": "2030-12-31",
  "issuingCountry": "Indonesia"
}
```

**Accessories:**
```json
{
  "brand": "Nike",
  "color": "Black",
  "size": "L",
  "material": "Leather"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Name and category are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized - Please login"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden - You do not own this item"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Item not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Security

- ✅ **Authentication Required:** All endpoints require valid JWT token
- ✅ **Ownership Verification:** Users can only access/modify their own items
- ✅ **Input Validation:** All inputs are validated and sanitized
- ✅ **Unique QR Codes:** Each item gets a unique QR code ID
- ✅ **Protected Routes:** Cannot access other users' items

---

## Testing

### Automated Test
```powershell
.\test-items.ps1
```

### Manual Test Examples

**Create Item:**
```powershell
$headers = @{ "Authorization" = "Bearer $token" }
$body = @{
    name = "My Laptop"
    category = "electronics"
    description = "Black Dell XPS 15"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items" `
  -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

**Get Items:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items" `
  -Method GET -Headers $headers
```

**Update Item:**
```powershell
$body = @{ status = "lost" } | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/items/$itemId" `
  -Method PUT -Body $body -ContentType "application/json" -Headers $headers
```

**Delete Item:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/items/$itemId" `
  -Method DELETE -Headers $headers
```

**Download QR Code:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/items/$itemId/qr" `
  -Headers $headers -OutFile "qrcode.png"
```

---

## Database Schema

See `src/models/Item.ts` for complete Mongoose schema.

**Collection:** `items`

**Indexes:**
- `qrCode` (unique)
- `userId` + `status`

---

**Items API Complete! ✅**
