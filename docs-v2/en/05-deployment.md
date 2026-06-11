# 05 - Deployment & Operations

This project is configured for automated deployment (CI/CD) to Vercel and leverages cloud-native services for all external dependencies.

## Primary Deployment Platform: Vercel

Vercel is the optimal hosting platform for Next.js. This project (`https://www.lostfoundplatform.me/`) is directly linked to the main repository.

### CI/CD Workflow
1. **Push to `main` branch**: Vercel automatically detects the changes.
2. **Automated Testing**: Run unit tests via `npm run test` to verify API and schema logic before or during deploy checks.
3. **Build Process**: Vercel executes the `npm run build` command, which incorporates `next build --turbopack`.
4. **Linting & Type Checking**: ESLint 9 (Flat Config) and TypeScript compiler checks (`npx tsc --noEmit`) run during the build to catch fatal errors.
5. **Deploy**: Upon a successful build and test pass, the system is immediately deployed to the production URL.

### Environment Variables in Vercel
Ensure all variables present in `.env.local` are populated in the Vercel project settings (Settings -> Environment Variables):
- MongoDB credentials.
- Ably and Resend API Keys.
- A highly secure `JWT_SECRET`.
- `NEXT_PUBLIC_APP_URL` set to the production domain (`https://www.lostfoundplatform.me`).

## Database Operations (MongoDB Atlas)

- **Connection**: Utilizes standard connection pooling from Mongoose, managed via a singleton utility to prevent connection leaks within the Next.js Serverless environment.
- **Indexes**: Ensure frequently queried fields, such as `email` in the User collection and `qrCode` in the Item collection, are indexed in Atlas for maximum performance.

## Observability & Monitoring

The project integrates performance metrics and analytics from Vercel:
1. **@vercel/analytics**: Tracks aggregate page views.
2. **@vercel/speed-insights**: Monitors Core Web Vitals (LCP, FID, CLS) directly from end-user browsers (real-user metrics).

## Ongoing Maintenance Guide

- Periodically update dependencies in `package.json` using `npm outdated` and `npm update`.
- Since this project utilizes Next.js 16+, ensure any external integrations (especially older libraries) remain compatible with React Server Components.
