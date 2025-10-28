import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { successResponse, errorResponse, parseBody } from '@/lib/api';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    // Parse request body
    const body = await parseBody<{ token: string; password: string }>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { token, password } = body;

    // Validate required fields
    if (!token || !password) {
      return NextResponse.json(
        errorResponse('Token and password are required'),
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 6) {
      return NextResponse.json(
        errorResponse('Password must be at least 6 characters'),
        { status: 400 }
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
        { status: 400 }
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
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset password error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
