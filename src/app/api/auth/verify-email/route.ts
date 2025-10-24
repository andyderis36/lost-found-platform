import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse } from '@/lib/api';

// GET /api/auth/verify-email?token=xxx - Verify email with token
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        errorResponse('Verification token is required'),
        { status: 400 }
      );
    }

    // Find user with this token
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }, // Token not expired
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('Invalid or expired verification token'),
        { status: 400 }
      );
    }

    // Already verified
    if (user.emailVerified) {
      return NextResponse.json(
        successResponse(
          { alreadyVerified: true },
          'Email already verified'
        ),
        { status: 200 }
      );
    }

    // Verify email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return NextResponse.json(
      successResponse(
        {
          email: user.email,
          verified: true,
        },
        'Email verified successfully! You can now login.'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Email verification error:', error);
    
    return NextResponse.json(
      errorResponse('Failed to verify email'),
      { status: 500 }
    );
  }
}

// POST /api/auth/verify-email/resend - Resend verification email
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        errorResponse('Email is required'),
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        errorResponse('Email is already verified'),
        { status: 400 }
      );
    }

    // Generate new token
    const { generateToken, sendVerificationEmail } = await import('@/lib/email');
    const verificationToken = generateToken();
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Update user with new token
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = verificationTokenExpires;
    await user.save();

    // Send verification email
    const result = await sendVerificationEmail(user.email, user.name, verificationToken);

    if (!result.success) {
      return NextResponse.json(
        errorResponse('Failed to send verification email'),
        { status: 500 }
      );
    }

    return NextResponse.json(
      successResponse(
        {
          message: 'Verification email sent',
          email: user.email,
        },
        'Verification email has been sent. Please check your inbox.'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Resend verification error:', error);
    
    return NextResponse.json(
      errorResponse('Failed to resend verification email'),
      { status: 500 }
    );
  }
}
