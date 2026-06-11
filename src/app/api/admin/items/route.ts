import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';
import { handleAdminAuth } from '@/lib/admin';

// GET /api/admin/items - Get all items from all users (admin only)
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Get authenticated user
    const authUser = getUserFromRequest(request);

    // Check admin role with stealth mode (return 404 instead of 401/403 to hide admin endpoint existence)
    const auth = handleAdminAuth(authUser ? { role: authUser.role } : null, true);
    if (!auth.allowed) {
      return NextResponse.json(
        errorResponse(auth.error),
        { status: auth.status }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const userId = searchParams.get('userId');

    // Build query
    const query: Record<string, unknown> = {};
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    if (userId) {
      query.userId = userId;
    }

    // Find items with user info
    const items = await Item.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    // Return items
    return NextResponse.json(
      successResponse({
        items: items.map(item => ({
          id: item._id.toString(),
          qrCode: item.qrCode,
          name: item.name,
          category: item.category,
          description: item.description,
          image: item.image,
          status: item.status,
          owner: item.userId ? {
            id: (item.userId as unknown as { _id: { toString: () => string }; name: string; email: string })._id.toString(),
            name: (item.userId as unknown as { _id: { toString: () => string }; name: string; email: string }).name,
            email: (item.userId as unknown as { _id: { toString: () => string }; name: string; email: string }).email,
          } : null,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        total: items.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get all items error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
