import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
// Import models to register schemas with Mongoose
import '@/models/Item';
import '@/models/User';
import { successResponse, errorResponse, parseBody, getUserFromRequest } from '@/lib/api';
import { getAblyToken } from '@/lib/ably';

/**
 * GET /api/notifications
 * Get all notifications for the current user
 * Query params: limit, skip, read
 */
export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
    const skip = parseInt(searchParams.get('skip') || '0');
    const read = searchParams.get('read'); // 'true', 'false', or undefined for all

    const query: { userId: string; read?: boolean } = { userId: authUser.userId };
    if (read === 'true') {
      query.read = true;
    } else if (read === 'false') {
      query.read = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('itemId', 'name description images')
        .populate('userId', 'name email'),
      Notification.countDocuments(query),
    ]);

    // Also get Ably token for client-side subscriptions
    let ablyToken = null;
    try {
      ablyToken = await getAblyToken();
    } catch (error) {
      console.warn('Failed to get Ably token:', error);
      // Continue without token, notifications will still work
    }

    return NextResponse.json(
      successResponse(
        {
          notifications,
          total,
          limit,
          skip,
          hasMore: skip + limit < total,
          ablyToken, // Client uses this to subscribe
        },
        'Notifications retrieved'
      )
    );
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch notifications'),
      { status: 500 }
    );
  }
}

/**
 * POST /api/notifications
 * Create a new notification (admin/internal use)
 * Body: { userId, itemId, type, title, message, data }
 */
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    // Only allow admins to create notifications manually
    if (authUser.role !== 'admin') {
      return NextResponse.json(
        errorResponse('Only admins can create notifications'),
        { status: 403 }
      );
    }

    const body = await parseBody<{
      userId: string;
      itemId: string;
      type: string;
      title: string;
      message: string;
      data?: Record<string, unknown>;
    }>(request);

    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const notification = new Notification({
      userId: body.userId,
      itemId: body.itemId,
      type: body.type,
      title: body.title,
      message: body.message,
      data: body.data || {},
    });

    await notification.save();

    return NextResponse.json(
      successResponse({ notification }, 'Notification created'),
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      errorResponse('Failed to create notification'),
      { status: 500 }
    );
  }
}
