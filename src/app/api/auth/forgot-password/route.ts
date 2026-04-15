import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { isValidEmail } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import { sendPasswordResetEmail } from '@/lib/email';
import {
  extractClientIp,
  limitByIP,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled()) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Check rate limit: 5 attempts per 15 minutes
      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.AUTH_FORGOT_PASSWORD.prefix,
        RATE_LIMITS.AUTH_FORGOT_PASSWORD.points,
        RATE_LIMITS.AUTH_FORGOT_PASSWORD.duration
      );

      if (!allowed) {
        logBlockedAttempt(
          clientIp,
          '/api/auth/forgot-password',
          `Too many reset attempts (${RATE_LIMITS.AUTH_FORGOT_PASSWORD.points} attempts per ${Math.floor(RATE_LIMITS.AUTH_FORGOT_PASSWORD.duration / 60)} min)`,
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many password reset attempts. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.AUTH_FORGOT_PASSWORD.duration.toString(),
            },
          }
        );
      }
    }

    await dbConnect();

    // Parse request body
    const body = await parseBody<{ email: string }>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        errorResponse('Email is required'),
        { status: 400 }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        errorResponse('Invalid email format'),
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // For security reasons, always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (!user) {
      console.log('Password reset requested for non-existent email:', email);
      return NextResponse.json(
        successResponse(
          null,
          'If an account exists with that email, you will receive a password reset link shortly.'
        ),
        { status: 200 }
      );
    }

    // Generate reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Set token expiry to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save token to database
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save();

    // Send reset email
    const emailResult = await sendPasswordResetEmail(
      user.email,
      user.name,
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json(
        errorResponse('Failed to send password reset email. Please try again later.'),
        { status: 500 }
      );
    }

    console.log('Password reset email sent successfully to:', user.email);

    // Return success response
    return NextResponse.json(
      successResponse(
        null,
        'If an account exists with that email, you will receive a password reset link shortly.'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Forgot password error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
