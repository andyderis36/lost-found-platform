import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import Item from '@/models/Item';
import User from '@/models/User';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import { sendScanNotificationEmail } from '@/lib/email';
import type { CreateScanRequest } from '@/types';

// POST /api/scans - Log a scan (public endpoint, no auth required)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    
    // Ensure User model is registered for populate() to work
    // This prevents MissingSchemaError in serverless cold starts
    if (!User) {
      throw new Error('User model not loaded');
    }

    // Parse request body
    const body = await parseBody<CreateScanRequest>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { qrCode, scannerName, scannerEmail, scannerPhone, location, message } = body;

    // Validate required field
    if (!qrCode) {
      return NextResponse.json(
        errorResponse('QR code is required'),
        { status: 400 }
      );
    }

    // Find item by QR code
    const item = await Item.findOne({ qrCode }).populate('userId', 'name email phone');

    if (!item) {
      return NextResponse.json(
        errorResponse('Item not found - Invalid QR code'),
        { status: 404 }
      );
    }

    // Validate at least one contact method is provided
    if (!scannerEmail && !scannerPhone && !scannerName) {
      return NextResponse.json(
        errorResponse('Please provide at least one contact method (name, email, or phone)'),
        { status: 400 }
      );
    }

    // Create scan log
    const scan = await Scan.create({
      itemId: item._id,
      scannerName: scannerName?.trim(),
      scannerEmail: scannerEmail?.trim().toLowerCase(),
      scannerPhone: scannerPhone?.trim(),
      location: location || undefined,
      message: message?.trim(),
      scannedAt: new Date(),
    });

    // Send email notification to item owner
    if (item.userId && item.userId.email) {
      try {
        await sendScanNotificationEmail(
          item.userId.email,
          item.userId.name || 'Owner',
          item.name,
          {
            name: scannerName,
            email: scannerEmail,
            phone: scannerPhone,
            message: message,
            location: location,
          }
        );
        console.log('✅ Scan notification email sent to owner');
      } catch (emailError) {
        console.error('⚠️ Failed to send scan notification email:', emailError);
        // Continue even if email fails - scan is already logged
      }
    }

    // Return success with item and owner info (hide sensitive owner data)
    return NextResponse.json(
      successResponse(
        {
          scan: {
            id: scan._id.toString(),
            itemId: item._id.toString(),
            scannedAt: scan.scannedAt,
          },
          item: {
            id: item._id.toString(),
            name: item.name,
            category: item.category,
            description: item.description,
            image: item.image,
            status: item.status,
          },
          message: 'Scan logged successfully! The owner will be notified.',
        },
        'Scan recorded successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Create scan error:', error);
    
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
