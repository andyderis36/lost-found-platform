import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import Item from '@/models/Item';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';
import mongoose from 'mongoose';

// GET /api/scans/[itemId] - Get scan history for an item (protected)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    await dbConnect();

    const { itemId } = await params;

    // Get authenticated user
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized - Please login'),
        { status: 401 }
      );
    }

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      return NextResponse.json(
        errorResponse('Invalid item ID'),
        { status: 400 }
      );
    }

    // Find item and verify ownership
    const item = await Item.findById(itemId);

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

    // Get all scans for this item, sorted by most recent
    const scans = await Scan.find({ itemId }).sort({ scannedAt: -1 });

    // Return scan history
    return NextResponse.json(
      successResponse({
        item: {
          id: item._id.toString(),
          name: item.name,
          qrCode: item.qrCode,
          status: item.status,
        },
        scans: scans.map(scan => ({
          id: scan._id.toString(),
          scannerName: scan.scannerName,
          scannerEmail: scan.scannerEmail,
          scannerPhone: scan.scannerPhone,
          location: scan.location ? {
            latitude: scan.location.latitude,
            longitude: scan.location.longitude,
            address: scan.location.address,
          } : undefined,
          message: scan.message,
          scannedAt: scan.scannedAt,
        })),
        total: scans.length,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get scans error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
