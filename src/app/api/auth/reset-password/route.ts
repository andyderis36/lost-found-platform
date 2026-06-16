import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, isValidPassword } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import {
  extractClientIp,
  limitByIP,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    let headers = {};

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled(RATE_LIMITS.AUTH_RESET_PASSWORD.prefix)) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.AUTH_RESET_PASSWORD.prefix,
        RATE_LIMITS.AUTH_RESET_PASSWORD.points,
        RATE_LIMITS.AUTH_RESET_PASSWORD.duration
      );

      if (!allowed) {
        logBlockedAttempt(
          clientIp,
          '/api/auth/reset-password',
          `Too many reset password attempts`,
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many attempts. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.AUTH_RESET_PASSWORD.duration.toString(),
            },
          }
        );
      }
      headers = { 'Retry-After': RATE_LIMITS.AUTH_RESET_PASSWORD.duration.toString() };
    }

    await dbConnect();

    // Parse request body
    const body = await parseBody<{ token: string; password: string }>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400, headers }
      );
    }

    const { token, password } = body;

    // Strict type validation to prevent NoSQL injection
    if (typeof token !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        errorResponse('Invalid input format'),
        { status: 400, headers }
      );
    }

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        errorResponse('Token and password are required'),
        { status: 400, headers }
      );
    }

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        errorResponse('Password must be at least 8 characters long.'),
        { status: 400, headers }
      );
    }

    // Find user by reset token and check if token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }, // Token must not be expired
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid or expired reset token. Please request a new password reset.'),
        { status: 400, headers }
      );
    }

    // Hash new password
    const passwordHash = await hashPassword(password);

    // Update user password and clear reset token
    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    console.log('Password reset successful for user:', user.email);

    // Return success response
    return NextResponse.json(
      successResponse(
        null,
        'Password reset successful. You can now login with your new password.'
      ),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
