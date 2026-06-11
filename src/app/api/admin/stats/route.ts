import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import Scan from '@/models/Scan';
import { successResponse, errorResponse, getUserFromRequest } from '@/lib/api';
import { handleAdminAuth } from '@/lib/admin';

// GET /api/admin/stats - Get platform statistics (admin only)
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

    // Get statistics
    const [
      totalUsers,
      totalAdmins,
      totalItems,
      activeItems,
      foundItems,
      inactiveItems,
      totalScans,
      recentScans,
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'admin' }),
      Item.countDocuments(),
      Item.countDocuments({ status: 'active' }),
      Item.countDocuments({ status: 'found' }),
      Item.countDocuments({ status: 'inactive' }),
      Scan.countDocuments(),
      Scan.find().sort({ scannedAt: -1 }).limit(10).populate('itemId', 'name qrCode'),
    ]);

    // Get scans per day (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const scansPerDay = await Scan.aggregate([
      {
        $match: {
          scannedAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$scannedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Get items by category
    const itemsByCategory = await Item.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    // Return statistics
    return NextResponse.json(
      successResponse({
        users: {
          total: totalUsers + totalAdmins,
          regular: totalUsers,
          admins: totalAdmins,
        },
        items: {
          total: totalItems,
          active: activeItems,
          found: foundItems,
          inactive: inactiveItems,
          byCategory: itemsByCategory.map(cat => ({
            category: cat._id,
            count: cat.count,
          })),
        },
        scans: {
          total: totalScans,
          perDay: scansPerDay.map(day => ({
            date: day._id,
            count: day.count,
          })),
          recent: recentScans.map(scan => ({
            id: scan._id.toString(),
            scannerName: scan.scannerName,
            item: scan.itemId ? {
              name: (scan.itemId as unknown as { name: string }).name,
              qrCode: (scan.itemId as unknown as { qrCode: string }).qrCode,
            } : null,
            scannedAt: scan.scannedAt,
          })),
        },
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Get statistics error:', error);
    
    return NextResponse.json(
      errorResponse('Internal server error'),
      { status: 500 }
    );
  }
}
