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

    // Strict type validation
    if (typeof token !== 'string' || !token) {
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

    const genericError = 'Invalid or expired verification token';

    if (!user) {
      return NextResponse.json(
        errorResponse(genericError),
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
