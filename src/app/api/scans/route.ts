import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Scan from '@/models/Scan';
import Item from '@/models/Item';
import User from '@/models/User';
import Notification from '@/models/Notification';
import { successResponse, errorResponse, parseBody } from '@/lib/api';
import { sendScanNotificationEmail } from '@/lib/email';
import { publishNotification } from '@/lib/ably';
import {
  extractClientIp,
  limitByIP,
  limitByIPAndResource,
  logBlockedAttempt,
  isRateLimitingEnabled,
  RATE_LIMITS,
} from '@/lib/rateLimiter';
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

    // Parse request body early for validation
    const body = await parseBody<CreateScanRequest>(request);
    
    if (!body) {
      return NextResponse.json(
        errorResponse('Invalid request body'),
        { status: 400 }
      );
    }

    const { qrCode, scannerName, scannerEmail, scannerPhone, location, message } = body;

    // Apply rate limiting (if enabled)
    if (isRateLimitingEnabled()) {
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || 'unknown';

      // Check global per-IP limit
      const globalAllowed = await limitByIP(
        clientIp,
        RATE_LIMITS.SCAN_GLOBAL.prefix,
        RATE_LIMITS.SCAN_GLOBAL.points,
        RATE_LIMITS.SCAN_GLOBAL.duration
      );

      if (!globalAllowed) {
        logBlockedAttempt(
          clientIp,
          '/api/scans',
          'Global rate limit exceeded (100 requests/hour)',
          userAgent
        );
        return NextResponse.json(
          errorResponse('Too many scan requests from your IP. Please try again later.'),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.SCAN_GLOBAL.duration.toString(),
            },
          }
        );
      }

      // Check per-(IP+qrCode) debounce to prevent spam scanning same QR code
      const debounceAllowed = await limitByIPAndResource(
        clientIp,
        qrCode,
        RATE_LIMITS.SCAN_DEBOUNCE.points,
        RATE_LIMITS.SCAN_DEBOUNCE.duration
      );

      if (!debounceAllowed) {
        logBlockedAttempt(
          clientIp,
          '/api/scans',
          `Debounce limit exceeded for QR code ${qrCode} (1 scan per ${RATE_LIMITS.SCAN_DEBOUNCE.duration}s)`,
          userAgent
        );
        return NextResponse.json(
          errorResponse(
            `Please wait before scanning this QR code again. Try again in ${RATE_LIMITS.SCAN_DEBOUNCE.duration} seconds.`
          ),
          {
            status: 429,
            headers: {
              'Retry-After': RATE_LIMITS.SCAN_DEBOUNCE.duration.toString(),
            },
          }
        );
      }
    }
    
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

      // Save notification to database for persistence
      try {
        await Notification.create({
          userId: item.userId._id,
          itemId: item._id,
          type: 'item_scanned',
          title: 'Your item was scanned',
          message: `"${item.name}" was scanned${location ? ` at ${location}` : ''}`,
          data: {
            qrCode,
            location: location || null,
            scannerName: scannerName || null,
            scannerEmail: scannerEmail || null,
            scannerPhone: scannerPhone || null,
            message: message || null,
            scannedAt: new Date().toISOString(),
          },
        });
        console.log('✅ Notification saved to database');
      } catch (dbError) {
        console.error('⚠️ Failed to save notification to database:', dbError);
        // Continue even if DB save fails - scan is already logged and email sent
      }

      // Emit real-time notification via Ably
      try {
        await publishNotification(item.userId._id.toString(), {
          type: 'item_scanned',
          title: 'Your item was scanned',
          message: `"${item.name}" was scanned${location ? ` at ${location}` : ''}`,
          data: {
            qrCode,
            location: location || null,
            scannerName: scannerName || null,
            scannerEmail: scannerEmail || null,
            scannerPhone: scannerPhone || null,
            message: message || null,
            scannedAt: new Date().toISOString(),
          },
        });
        console.log('✅ Real-time notification published via Ably');
      } catch (ablyError) {
        console.error('⚠️ Failed to publish real-time notification:', ablyError);
        // Continue even if Ably fails - scan is already logged and email sent
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
