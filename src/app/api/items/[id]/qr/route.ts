import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { generateQRCodeBuffer } from '@/lib/qrcode';
import { errorResponse, getUserFromRequest } from '@/lib/api';
import mongoose from 'mongoose';

// GET /api/items/[id]/qr - Download QR code as image
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

    // Check ownership
    if (item.userId.toString() !== authUser.userId) {
      return NextResponse.json(
        errorResponse('Forbidden - You do not own this item'),
        { status: 403 }
      );
    }

    // Generate QR code as buffer
    const qrBuffer = await generateQRCodeBuffer(item.qrCode);

    // Return QR code as PNG image
    return new NextResponse(qrBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${item.qrCode}.png"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
