import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

/**
 * Standard API response format
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create success response
 */
export function successResponse<T>(data: T, message?: string): ApiResponse<T> {
  return {
    success: true,
    data,
    message,
  };
}

/**
 * Create error response
 */
export function errorResponse(error: string): ApiResponse {
  return {
    success: false,
    error,
  };
}

/**
 * Extract user from request token
 */
export function getUserFromRequest(
  request: NextRequest
): { userId: string; email: string; role?: string } | null {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  return verifyToken(token);
}

/**
 * Parse JSON body safely
 */
export async function parseBody<T>(request: NextRequest): Promise<T | null> {
  try {
    return await request.json();
  } catch {
    return null;
  }
}
