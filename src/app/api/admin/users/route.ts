import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';

// GET /api/admin/users - Get all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized - Please login'),
        { status: 401 }
      );
    }

    // Check admin role
    try {
      requireAdmin({ role: authUser.role });
    } catch {
      return NextResponse.json(
        errorResponse('Admin access required'),
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role'); // Filter by role
    const search = searchParams.get('search'); // Search by name or email

    // Build query
    const query: Record<string, unknown> = {};
    
    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Get all users (exclude passwordHash)
    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    // Get item counts for all users
    const userIds = users.map(user => user._id);
    const itemCounts = await Item.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    // Create a map of userId -> itemCount
    const itemCountMap = new Map(
      itemCounts.map(item => [item._id.toString(), item.count])
    );

    // Return users
    return NextResponse.json(
      successResponse({
        users: users.map(user => ({
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          emailVerified: user.emailVerified,
          itemCount: itemCountMap.get(user._id.toString()) || 0,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })),
        total: users.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get users error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
