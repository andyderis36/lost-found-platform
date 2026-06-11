import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Extract user from JWT token
    const authUser = getUserFromRequest(request);
    
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized - Invalid or missing token'),
        { status: 401 }
      );
    }

    // Find user in database
    const user = await User.findById(authUser.userId).select('-passwordHash');
    
    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Return user data
    return NextResponse.json(
      successResponse({
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        phone: user.phone,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get user error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
