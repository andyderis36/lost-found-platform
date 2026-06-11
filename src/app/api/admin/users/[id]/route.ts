import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import Scan from '@/models/Scan';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';
import { requireAdmin } from '@/lib/admin';
import mongoose from 'mongoose';

// DELETE /api/admin/users/[id] - Delete user (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid user ID'),
        { status: 400 }
      );
    }

    // Prevent admin from deleting themselves
    if (id === authUser.userId) {
      return NextResponse.json(
        errorResponse('Cannot delete your own account'),
        { status: 400 }
      );
    }

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Delete user's items
    const userItems = await Item.find({ userId: id });
    const itemIds = userItems.map(item => item._id);

    // Delete scans related to user's items
    if (itemIds.length > 0) {
      await Scan.deleteMany({ itemId: { $in: itemIds } });
    }

    // Delete user's items
    await Item.deleteMany({ userId: id });

    // Delete user
    await User.findByIdAndDelete(id);

    return NextResponse.json(
      successResponse(
        { deletedUserId: id },
        'User and all associated data deleted successfully'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete user error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// PUT /api/admin/users/[id] - Update user (admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid user ID'),
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, phone, role } = body;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    // Update fields
    if (name) user.name = name.trim();
    if (phone !== undefined) user.phone = phone?.trim();
    if (role && ['user', 'admin'].includes(role)) {
      // Prevent demoting yourself
      if (id === authUser.userId && role !== 'admin') {
        return NextResponse.json(
          errorResponse('Cannot change your own role'),
          { status: 400 }
        );
      }
      user.role = role;
    }

    await user.save();

    return NextResponse.json(
      successResponse(
        {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          phone: user.phone,
          role: user.role,
          updatedAt: user.updatedAt,
        },
        'User updated successfully'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update user error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
