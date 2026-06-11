import { NextResponse } from 'next/server';
import { successResponse } from '@/lib/api';

/**
 * POST /api/auth/logout - Clear authentication cookie
 */
export async function POST() {
  const response = NextResponse.json(
    successResponse(null, 'Logged out successfully'),
    { status: 200 }
  );

  // Clear the auth_token cookie
  response.cookies.set({
    name: 'auth_token',
    value: '',
    httpOnly: true,
    expires: new Date(0), // Set to past date to expire immediately
    path: '/',
  });

  return response;
}
