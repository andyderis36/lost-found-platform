import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, errorResponse } from '@/lib/api';
import { getAblyToken } from '@/lib/ably';

/**
 * POST /api/notifications/auth
 * Get Ably token for client-side authentication
 * Used by Ably client to authenticate without exposing API key
 */
export async function POST(request: NextRequest) {
  try {
    const authUser = getUserFromRequest(request);
    if (!authUser) {
      return NextResponse.json(
        errorResponse('Unauthorized'),
        { status: 401 }
      );
    }

    const token = await getAblyToken();

    if (!token) {
      return NextResponse.json(
        errorResponse('Failed to generate Ably token'),
        { status: 500 }
      );
    }

    return NextResponse.json({
      token,
    });
  } catch (error) {
    console.error('Error generating Ably token:', error);
    return NextResponse.json(
      errorResponse('Failed to generate token'),
      { status: 500 }
    );
  }
}
