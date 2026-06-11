import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/api';
import {
  extractClientIp,
  limitByIP,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';

// POST /api/auth/verify-email/resend - Resend verification email
export async function POST(request: NextRequest) {
  try {
    let headers = {};

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled()) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.AUTH_VERIFY_EMAIL.prefix,
        RATE_LIMITS.AUTH_VERIFY_EMAIL.points,
        RATE_LIMITS.AUTH_VERIFY_EMAIL.duration
      );

      if (!allowed) {
        logBlockedAttempt(
          clientIp,
          '/api/auth/verify-email/resend',
          `Too many verification email resend attempts`,
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many attempts. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.AUTH_VERIFY_EMAIL.duration.toString(),
            },
          }
        );
      }
      headers = { 'Retry-After': RATE_LIMITS.AUTH_VERIFY_EMAIL.duration.toString() };
    }

    await dbConnect();

    const body = await request.json();
    const { email } = body;

    // Strict type validation
    if (typeof email !== 'string' || !email) {
      return NextResponse.json(
        errorResponse('Email is required'),
        { status: 400, headers }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    // Success message used for all outcomes to prevent user enumeration
    const successMsg = 'If an account exists with this email, a verification link has been sent.';

    if (!user) {
      // Return 200 anyway to prevent enumeration
      return NextResponse.json(
        successResponse(null, successMsg),
        { status: 200, headers }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      // Return 200 anyway to prevent enumeration
      return NextResponse.json(
        successResponse(null, successMsg),
        { status: 200, headers }
      );
    }

    // Generate new token
    const crypto = await import('crypto');
    const { sendVerificationEmail } = await import('@/lib/email');
    const verificationToken = crypto.default.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    await sendVerificationEmail(user.email, user.name, verificationToken);

    return NextResponse.json(
      successResponse(
        {
          email: user.email,
        },
        successMsg
      ),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    
    return NextResponse.json(
      errorResponse('Failed to resend verification email'),
      { status: 500 }
    );
  }
}
