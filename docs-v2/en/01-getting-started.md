# 01 - Getting Started

This guide will help you set up the local development environment for the Lost & Found Platform.

## System Prerequisites

Before starting, ensure your system has the following installed:
- **Node.js**: Version 20.x or newer. Using NVM (Node Version Manager) is recommended.
- **npm**: (Included in the Node.js installation).
- **Git**: For version control.
- **MongoDB**: A MongoDB Atlas (Cloud) account or a local MongoDB instance.
- **Ably**: An Ably account for realtime notification features.
- **Resend**: A Resend account with a verified domain for email delivery.

## Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd lost-found-platform
   ```

2. **Install Dependencies**
   This project uses `npm`. Run the following command:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Copy the `.env.example` file (if available) to `.env.local` or create a `.env.local` file in the project root. The following variables are required:

   ```env
   # Database
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>

   # Authentication (JWT)
   JWT_SECRET=your_very_long_and_secure_jwt_secret
   JWT_EXPIRES_IN=7d

   # Next.js App URL (for email/QR callbacks)
   NEXT_PUBLIC_APP_URL=http://localhost:3000

   # Ably (Realtime Notifications)
   ABLY_API_KEY=your_ably_api_key

   # Resend (Email Service)
   RESEND_API_KEY=your_resend_api_key
   EMAIL_FROM=noreply@lostfoundplatform.me
   ```

4. **Run the Development Server**
   This project utilizes Turbopack for faster build and refresh times.
   ```bash
   npm run dev
   ```
   The application will be accessible at `http://localhost:3000`.

## Main Scripts

- `npm run dev`: Starts the local development server with Turbopack.
- `npm run build`: Builds the application for production.
- `npm run start`: Starts the production server from the build output.
- `npm run lint`: Runs ESLint to check code quality and formatting.
