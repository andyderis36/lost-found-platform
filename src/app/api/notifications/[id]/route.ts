import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Notification from '@/models/Notification';
import { successResponse, errorResponse, parseBody, getUserFromRequest } from '@/lib/api';
import mongoose from 'mongoose';

/**
 * GET /api/notifications/[id]
 * Get a specific notification
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid notification ID'),
        { status: 400 }
      );
    }

    const notification = await Notification.findById(id)
      .populate('itemId', 'name description images')
      .populate('userId', 'name email');

    if (!notification) {
      return NextResponse.json(
        errorResponse('Notification not found'),
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId._id.toString() !== authUser.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    return NextResponse.json(
      successResponse({ notification }, 'Notification retrieved')
    );
  } catch (error) {
    console.error('Error fetching notification:', error);
    return NextResponse.json(
      errorResponse('Failed to fetch notification'),
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/notifications/[id]
 * Update notification (mark as read, etc)
 * Body: { read, readAt }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid notification ID'),
        { status: 400 }
      );
    }

    const body = await parseBody<{
      read?: boolean;
      readAt?: string;
    }>(request);

    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return NextResponse.json(
        errorResponse('Notification not found'),
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId.toString() !== authUser.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    // Update fields
    if (body.read !== undefined) {
      notification.read = body.read;
      if (body.read) {
        notification.readAt = new Date();
      } else {
        notification.readAt = undefined;
      }
    }

    await notification.save();

    return NextResponse.json(
      successResponse({ notification }, 'Notification updated')
    );
  } catch (error) {
    console.error('Error updating notification:', error);
    return NextResponse.json(
      errorResponse('Failed to update notification'),
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/notifications/[id]
 * Delete a specific notification
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid notification ID'),
        { status: 400 }
      );
    }

    const notification = await Notification.findById(id);

    if (!notification) {
      return NextResponse.json(
        errorResponse('Notification not found'),
        { status: 404 }
      );
    }

    // Check ownership
    if (notification.userId.toString() !== authUser.userId) {
      return NextResponse.json(
        errorResponse('Forbidden'),
        { status: 403 }
      );
    }

    await Notification.deleteOne({ _id: id });

    return NextResponse.json(
      successResponse({}, 'Notification deleted')
    );
  } catch (error) {
    console.error('Error deleting notification:', error);
    return NextResponse.json(
      errorResponse('Failed to delete notification'),
      { status: 500 }
    );
  }
}
