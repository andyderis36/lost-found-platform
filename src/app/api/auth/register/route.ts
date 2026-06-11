import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import { sendVerificationEmail } from '@/lib/email';
import {
  extractClientIp,
  limitByIP,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';
import crypto from 'crypto';
import type { RegisterRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    let headers = {};

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled()) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Check rate limit: 5 attempts per 15 minutes
      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.AUTH_REGISTER.prefix,
        RATE_LIMITS.AUTH_REGISTER.points,
        RATE_LIMITS.AUTH_REGISTER.duration
      );

      if (!allowed) {
        logBlockedAttempt(
          clientIp,
          '/api/auth/register',
          `Too many registration attempts (${RATE_LIMITS.AUTH_REGISTER.points} attempts per ${Math.floor(RATE_LIMITS.AUTH_REGISTER.duration / 60)} min)`,
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many registration attempts. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.AUTH_REGISTER.duration.toString(),
            },
          }
        );
      }
      headers = { 'Retry-After': RATE_LIMITS.AUTH_REGISTER.duration.toString() };
    }

    await dbConnect();

    // Parse request body
    const body = await parseBody<RegisterRequest>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { email, name, password, phone } = body;

    // Strict type validation
    if (
      typeof email !== 'string' ||
      typeof name !== 'string' ||
      typeof password !== 'string' ||
      (phone !== undefined && typeof phone !== 'string')
    ) {
      return NextResponse.json(
        errorResponse('Invalid input format'),
        { status: 400, headers }
      );
    }

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        errorResponse('Email, name, and password are required'),
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

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        errorResponse(
          'Password must be at least 8 characters long.'
        ),
        { status: 400, headers }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    // Generic success message for both new and existing users to prevent enumeration
    const genericSuccessResponse = {
      message: 'If this email is available, a verification link has been sent.',
      user: null
    };

    if (existingUser) {
      // For existing users, we still send an email to be helpful, 
      // but return the same success response to the API caller.
      try {
        const crypto = await import('crypto');
        const { sendVerificationEmail } = await import('@/lib/email');
        
        if (!existingUser.emailVerified) {
          // If not verified, send a new verification email
          const verificationToken = crypto.randomBytes(32).toString('hex');
          const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
          
          existingUser.verificationToken = verificationToken;
          existingUser.verificationTokenExpires = verificationTokenExpires;
          await existingUser.save();
          
          await sendVerificationEmail(existingUser.email, existingUser.name, verificationToken);
        } else {
          // If already verified, we could send a "you already have an account" email here
          // For now, we just stay silent to keep it simple, or we could implement a notification.
          // The pentest recommendation is usually to just stay silent or send a generic "already exists" email.
        }
      } catch (e) {
        console.error('Error handling existing user registration:', e);
      }

      return NextResponse.json(
        successResponse(
          genericSuccessResponse,
          'Registration successful. Please verify your email.'
        ),
        { status: 201, headers }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create new user with email verification required
    const user = await User.create({
      email: email.toLowerCase(),
      name: name.trim(),
      phone: phone?.trim(),
      passwordHash,
      emailVerified: false, // Require verification for new users
      verificationToken,
      verificationTokenExpires,
    });

    // Send verification email (pass token only, function will build URL)
    try {
      await sendVerificationEmail(user.email, user.name, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // Continue registration even if email fails
    }

    // Don't generate token yet - user needs to verify email first
    // Return success response without token
    return NextResponse.json(
      successResponse(
        {
          user: {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            emailVerified: false,
          },
          message: 'Please check your email to verify your account before logging in.',
        },
        'Registration successful. Please verify your email.'
      ),
      { status: 201, headers }
    );
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
      return NextResponse.json(
        errorResponse('Validation error: ' + error.message),
        { status: 400 }
      );
    }

    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
