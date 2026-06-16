import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Item from '@/models/Item';
import { isValidQRCodeId } from '@/lib/qrcode';
import { successResponse, errorResponse } from '@/lib/api';
import {
  extractClientIp,
  limitByIP,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';

// GET /api/items/public/[qrCode] - Get item by QR code (public, no auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ qrCode: string }> }
) {
  try {
    let headers = {};

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled(RATE_LIMITS.PUBLIC_ITEM.prefix)) {
      const clientIp = extractClientIp(request);

      const allowed = await limitByIP(
        clientIp,
        RATE_LIMITS.PUBLIC_ITEM.prefix,
        RATE_LIMITS.PUBLIC_ITEM.points,
        RATE_LIMITS.PUBLIC_ITEM.duration
      );

      if (!allowed) {
        return NextResponse.json(
          errorResponse('Too many requests. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.PUBLIC_ITEM.duration.toString(),
            },
          }
        );
      }
      headers = { 'Retry-After': RATE_LIMITS.PUBLIC_ITEM.duration.toString() };
    }

    await dbConnect();

    const { qrCode } = await params;

    // Validate QR code format
    if (!isValidQRCodeId(qrCode)) {
      return NextResponse.json(
        errorResponse('Invalid QR code format'),
        { status: 400 }
      );
    }

    // Find item by QR code
    const item = await Item.findOne({ qrCode });

    if (!item) {
      return NextResponse.json(
        errorResponse('Item not found'),
        { status: 404 }
      );
    }

    // Return public item info (no owner details)
    return NextResponse.json(
      successResponse({
        id: item._id.toString(),
        name: item.name,
        category: item.category,
        description: item.description,
        image: item.image,
        status: item.status,
        qrCode: item.qrCode,
        customFields: item.customFields || {},
      }),
      { status: 200, headers }
    );
  } catch (error) {
    console.error('Get public item error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
