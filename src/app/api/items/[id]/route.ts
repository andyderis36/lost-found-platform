import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { generateQRCodeDataURL } from '@/lib/qrcode';
import { successResponse, errorResponse, getUserFromRequest, parseBody } from '@/lib/api';

import type { UpdateItemRequest } from '@/types';
import mongoose from 'mongoose';
import { updateItemSchema } from '@/lib/validation';

// GET /api/items/[id] - Get single item
export async function GET(
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid item ID'),
        { status: 400 }
      );
    }

    // Find item
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        errorResponse('Item not found'),
        { status: 404 }
      );
    }

    // Check ownership (allow admin to access any item)
    const isOwner = item.userId.toString() === authUser.userId;
    const isAdmin = authUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        errorResponse('Forbidden - You do not own this item'),
        { status: 403 }
      );
    }

    // Generate QR code data URL
    const qrCodeDataUrl = await generateQRCodeDataURL(item.qrCode);

    // Return item
    return NextResponse.json(
      successResponse({
        id: item._id.toString(),
        qrCode: item.qrCode,
        name: item.name,
        category: item.category,
        description: item.description,
        image: item.image,
        customFields: item.customFields,
        status: item.status,
        qrCodeDataUrl,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get item error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}

// PUT /api/items/[id] - Update item
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid item ID'),
        { status: 400 }
      );
    }


    // Parse and validate request body
    const body = await parseBody<UpdateItemRequest>(request);
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }
    const parsed = updateItemSchema.safeParse(body);
    if (!parsed.success) {
        return NextResponse.json(
          errorResponse('Validation error: ' + parsed.error.issues.map((e: { message: string }) => e.message).join(', ')),
          { status: 400 }
        );
    }
    const validBody = parsed.data;

    // Find item
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        errorResponse('Item not found'),
        { status: 404 }
      );
    }

    // Check ownership (allow admin to update any item)
    const isOwner = item.userId.toString() === authUser.userId;
    const isAdmin = authUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        errorResponse('Forbidden - You do not own this item'),
        { status: 403 }
      );
    }


    // Update item
    if (validBody.name !== undefined) item.name = validBody.name.trim();
    if (validBody.category !== undefined) item.category = validBody.category;
    if (validBody.description !== undefined) item.description = validBody.description.trim();
    if (validBody.image !== undefined) item.image = validBody.image;
    if (validBody.customFields !== undefined) item.customFields = validBody.customFields;
    if (validBody.status !== undefined) item.status = validBody.status;

    await item.save();

    // Generate QR code data URL
    const qrCodeDataUrl = await generateQRCodeDataURL(item.qrCode);

    // Return updated item
    return NextResponse.json(
      successResponse(
        {
          id: item._id.toString(),
          qrCode: item.qrCode,
          name: item.name,
          category: item.category,
          description: item.description,
          image: item.image,
          customFields: item.customFields,
          status: item.status,
          qrCodeDataUrl,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        'Item updated successfully'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Update item error:', error);
    
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

// DELETE /api/items/[id] - Delete item
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

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        errorResponse('Invalid item ID'),
        { status: 400 }
      );
    }

    // Find item
    const item = await Item.findById(id);

    if (!item) {
      return NextResponse.json(
        errorResponse('Item not found'),
        { status: 404 }
      );
    }

    // Check ownership (allow admin to delete any item)
    const isOwner = item.userId.toString() === authUser.userId;
    const isAdmin = authUser.role === 'admin';
    
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        errorResponse('Forbidden - You do not own this item'),
        { status: 403 }
      );
    }

    // Delete item
    await Item.findByIdAndDelete(id);

    // Return success
    return NextResponse.json(
      successResponse(
        { id: id },
        'Item deleted successfully'
      ),
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete item error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
