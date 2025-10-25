import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword, isValidEmail, isValidPassword } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import { sendVerificationEmail } from '@/lib/email';
import crypto from 'crypto';
import type { RegisterRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
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

    // Validate required fields
    if (!email || !name || !password) {
      return NextResponse.json(
        errorResponse('Email, name, and password are required'),
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

    // Validate password strength
    if (!isValidPassword(password)) {
      return NextResponse.json(
        errorResponse(
          'Password must be at least 6 characters'
        ),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        errorResponse('User with this email already exists'),
        { status: 409 }
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
      { status: 201 }
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
