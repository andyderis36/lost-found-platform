import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { generateQRCodeId, generateQRCodeDataURL } from '@/lib/qrcode';
import { successResponse, errorResponse, getUserFromRequest, parseBody } from '@/lib/api';
import type { CreateItemRequest } from '@/types';

// POST /api/items - Create new item
export async function POST(request: NextRequest) {
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

    // Parse request body
    const body = await parseBody<CreateItemRequest>(request);
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { name, category, description, image, customFields } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json(
        errorResponse('Name and category are required'),
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'Electronics',
      'Personal Items',
      'Bags & Luggage',
      'Jewelry',
      'Documents',
      'Keys',
      'Sports Equipment',
      'Other'
    ];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        errorResponse(`Invalid category. Must be one of: ${validCategories.join(', ')}`),
        { status: 400 }
      );
    }

    // Generate unique QR code ID
    let qrCode = generateQRCodeId();
    
    // Ensure uniqueness (very unlikely to collide, but just in case)
    let existingItem = await Item.findOne({ qrCode });
    while (existingItem) {
      qrCode = generateQRCodeId();
      existingItem = await Item.findOne({ qrCode });
    }

    // Generate QR code image as data URL
    const qrCodeDataUrl = await generateQRCodeDataURL(qrCode);

    // Create new item
    const item = await Item.create({
      userId: authUser.userId,
      qrCode,
      name: name.trim(),
      category,
      description: description?.trim(),
      image,
      customFields: customFields || {},
      status: 'active',
    });

    // Return success response
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
          qrCodeDataUrl, // Base64 QR code image
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        },
        'Item created successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create item error:', error);
    
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

// GET /api/items - List all items for authenticated user
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // Filter by status
    const category = searchParams.get('category'); // Filter by category

    // Build query
    const query: Record<string, unknown> = { userId: authUser.userId };
    
    if (status) {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }

    // Find items
    const items = await Item.find(query).sort({ createdAt: -1 });

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
          customFields: item.customFields,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        })),
        total: items.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get items error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
