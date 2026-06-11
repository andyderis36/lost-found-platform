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
