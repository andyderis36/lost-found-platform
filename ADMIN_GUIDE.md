# Admin System Guide

## Overview

The Lost & Found Platform now includes a comprehensive admin system that allows designated users to manage all users and items across the platform.

## Features

### 1. Role-Based Access Control
- **User Role**: Default role for all registered users
- **Admin Role**: Special role with elevated privileges

### 2. Admin Dashboard (`/admin`)
- Platform statistics (users, items, scans)
- Items by category breakdown
- Recent scan activity
- Quick navigation to management pages

### 3. User Management (`/admin/users`)
- View all registered users
- Filter by role (admin/user) or search by name/email
- Edit user information (name, email, phone, role)
- Delete users (cascades to their items and scans)
- Cannot delete yourself or change your own role

### 4. Item Management (`/admin/items`)
- View all items from all users
- Filter by status, category, or user ID
- View item details and QR code pages
- See item owner information

## Creating the First Admin

### Method 1: Using the PowerShell Script (Recommended)

1. Register a regular user account first
2. Run the admin creation script:
   ```powershell
   .\make-admin.ps1
   ```
3. Enter the email of the user you want to make admin
4. Enter your MongoDB connection string (or press Enter for localhost)
5. Log out and log back in to see admin features

### Method 2: Direct MongoDB Update

If you're using MongoDB Compass or another MongoDB client:

```javascript
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

### Method 3: MongoDB Shell

```bash
mongosh "mongodb://localhost:27017/lost-found"

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

## Admin API Endpoints

### GET /api/admin/stats
Returns platform statistics including:
- Total users (regular + admins)
- Total items (active, found, inactive)
- Total scans
- Items by category
- Scans per day (last 7 days)
- Recent scan activity

**Authorization**: Requires admin role

**Response**:
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "regular": 8,
      "admins": 2
    },
    "items": {
      "total": 45,
      "active": 30,
      "found": 10,
      "inactive": 5,
      "byCategory": [
        { "category": "Electronics", "count": 15 },
        { "category": "Documents", "count": 10 }
      ]
    },
    "scans": {
      "total": 120,
      "perDay": [...],
      "recent": [...]
    }
  }
}
```

### GET /api/admin/users
List all users with optional filters

**Authorization**: Requires admin role

**Query Parameters**:
- `role` (optional): Filter by role (user/admin)
- `search` (optional): Search by name or email

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user123",
      "email": "user@example.com",
      "name": "John Doe",
      "phone": "08123456789",
      "role": "user",
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### PUT /api/admin/users/[id]
Update user information or role

**Authorization**: Requires admin role

**Request Body**:
```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "phone": "08123456789",
  "role": "admin"
}
```

**Restrictions**:
- Cannot change your own role
- All fields are optional

### DELETE /api/admin/users/[id]
Delete a user and all their data (items, scans)

**Authorization**: Requires admin role

**Restrictions**:
- Cannot delete yourself

**Cascade Deletion**:
- Deletes user
- Deletes all items owned by the user
- Deletes all scans by the user

### GET /api/admin/items
List all items from all users

**Authorization**: Requires admin role

**Query Parameters**:
- `status` (optional): Filter by status (active/found/inactive)
- `category` (optional): Filter by category
- `userId` (optional): Filter by user ID

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "item123",
      "name": "iPhone 13",
      "category": "Electronics",
      "status": "active",
      "qrCode": "QR123ABC",
      "user": {
        "id": "user123",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

## Security Features

1. **JWT Token Validation**: All admin endpoints verify JWT tokens
2. **Role Verification**: Checks that the user has role === 'admin'
3. **Self-Protection**: Cannot delete or demote yourself
4. **Cascade Deletion**: Properly cleans up related data when deleting users

## User Interface

### Admin Link in Navbar
- Admin users see a purple "⚡ Admin" link in the navbar
- Link visible on both desktop and mobile views
- Regular users don't see this link

### Admin Dashboard
- Clean, modern design with statistics cards
- Quick navigation cards to management pages
- Recent activity feed
- Visual indicators for different metrics

### User Management Page
- Table view with user details
- Edit modal for updating user information
- Confirmation dialogs for destructive actions
- Filter and search functionality

### Item Management Page
- Grid view of all items
- Filter by status, category, and user
- Quick links to item details and QR pages
- Owner information displayed for each item

## Best Practices

1. **Create Multiple Admins**: Don't rely on a single admin account
2. **Regular Audits**: Check user and item lists regularly
3. **Careful Deletion**: User deletion cascades to all their data
4. **Role Management**: Only promote trusted users to admin
5. **Monitor Stats**: Use the dashboard to track platform growth

## Troubleshooting

### Admin Link Not Showing
- Make sure you logged out and back in after being made admin
- Check that the role field in the database is set to "admin" (lowercase)
- Clear browser cache and cookies

### Cannot Access Admin Routes
- Verify your JWT token includes the role field
- Check browser console for errors
- Ensure you're logged in with an admin account

### Database Update Not Working
- Verify MongoDB connection string
- Check that the user exists in the database
- Ensure MongoDB is running

## Future Enhancements

Potential features to add:
- Bulk user operations
- Export data to CSV
- More detailed analytics
- Activity logs/audit trail
- Email notifications for admin actions
- User suspension (instead of deletion)
- Item moderation/approval workflow
