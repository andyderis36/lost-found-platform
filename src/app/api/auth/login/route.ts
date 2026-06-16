import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { comparePassword, generateToken, isValidEmail } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import {
  extractClientIp,
  limitByIP,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';
import type { LoginRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    let headers = {};

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled(RATE_LIMITS.AUTH_LOGIN.prefix)) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Check rate limit: 5 attempts per 15 minutes
      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.AUTH_LOGIN.prefix,
        RATE_LIMITS.AUTH_LOGIN.points,
        RATE_LIMITS.AUTH_LOGIN.duration
      );

      if (!allowed) {
        logBlockedAttempt(
          clientIp,
          '/api/auth/login',
          `Too many login attempts (${RATE_LIMITS.AUTH_LOGIN.points} attempts per ${Math.floor(RATE_LIMITS.AUTH_LOGIN.duration / 60)} min)`,
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many login attempts. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.AUTH_LOGIN.duration.toString(),
            },
          }
        );
      }
      headers = { 'Retry-After': RATE_LIMITS.AUTH_LOGIN.duration.toString() };
    }

    await dbConnect();

    // Parse request body
    const body = await parseBody<LoginRequest>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { email, password } = body;

    // Strict type validation to prevent NoSQL injection
    if (typeof email !== 'string' || typeof password !== 'string') {
      return NextResponse.json(
        errorResponse('Invalid input format'),
        { status: 400, headers }
      );
    }

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        errorResponse('Email and password are required'),
        { status: 400, headers }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return NextResponse.json(
        errorResponse('Invalid email format'),
        { status: 400, headers }
      );
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Generic error message for both "not found" and "wrong password"
    const genericError = 'Invalid email or password';

    if (!user) {
      return NextResponse.json(
        errorResponse(genericError),
        { status: 401, headers }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        errorResponse(genericError),
        { status: 401, headers }
      );
    }

    // Check email verification
    // To prevent user enumeration, we use the same 401 status and generic message
    // or a slightly modified one that doesn't reveal account existence.
    // The pentest report suggests returning the same response as invalid credentials.
    if (user.emailVerified === false) {
      return NextResponse.json(
        errorResponse(genericError),
        { status: 401, headers }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // Return success response with cookie
    const response = NextResponse.json(
      successResponse(
        {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            phone: user.phone,
            role: user.role,
          },
        },
        'Login successful'
      ),
      { status: 200, headers }
    );

    // Set HttpOnly cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days (matching JWT expiry)
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
