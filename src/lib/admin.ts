import { IUser } from '@/models/User';

/**
 * Check if user is admin
 */
export function isAdmin(user: { role?: string } | null): boolean {
  return user?.role === 'admin';
}

/**
 * Require admin role - throw error if not admin
 */
export function requireAdmin(user: { role?: string } | null): void {
  if (!user || user.role !== 'admin') {
    throw new Error('Admin access required');
  }
}

/**
 * Handle admin authorization with optional stealth mode (404 instead of 403)
 */
export function handleAdminAuth(user: { role?: string } | null, stealth: boolean = false): { allowed: boolean; status: number; error: string } {
  if (!user) {
    return { allowed: false, status: stealth ? 404 : 401, error: stealth ? 'Not Found' : 'Unauthorized' };
  }
  if (user.role !== 'admin') {
    return { allowed: false, status: stealth ? 404 : 403, error: stealth ? 'Not Found' : 'Forbidden' };
  }
  return { allowed: true, status: 200, error: '' };
}

/**
 * Admin response with role info
 */
export interface AdminUser {
  userId: string;
  email: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
}

export function formatAdminUser(user: IUser): AdminUser {
  return {
    userId: user._id.toString(),
    email: user.email,
    name: user.name,
    phone: user.phone,
    role: user.role,
  };
}
