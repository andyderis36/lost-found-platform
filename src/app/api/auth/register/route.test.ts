import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from './route';
import { NextRequest } from 'next/server';
import User from '@/models/User';

vi.mock('@/lib/mongodb', () => ({
  default: vi.fn(),
}));

vi.mock('@/models/User', () => {
  return {
    default: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
  };
});

vi.mock('@/lib/email', () => ({
  sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

vi.mock('@/lib/rateLimiter', () => ({
  extractClientIp: vi.fn().mockReturnValue('127.0.0.1'),
  limitByIP: vi.fn().mockResolvedValue(true),
  logBlockedAttempt: vi.fn(),
  isRateLimitingEnabled: vi.fn().mockReturnValue(true),
  RATE_LIMITS: {
    AUTH_REGISTER: {
      prefix: 'auth-register',
      points: 5,
      duration: 900,
    },
  },
}));

describe('Register API Endpoint', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 for invalid email format', async () => {
    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        name: 'Test User',
        password: 'Password123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
    
    const data = await res.json();
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid email format');
  });

  it('should return 201 with generic message for existing email to prevent user enumeration', async () => {
    // Mock existing user
    vi.mocked(User.findOne).mockResolvedValue({
      email: 'existing@example.com',
      name: 'Existing User',
      emailVerified: true,
      save: vi.fn().mockResolvedValue(true),
    });

    const req = new NextRequest('http://localhost/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        email: 'existing@example.com',
        name: 'New Name',
        password: 'Password123!',
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.data.message).toContain('verification link has been sent');
    expect(data.data.user).toBeNull();
  });
});
