import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

function requireJwtSecret(): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set. Define it in the environment before starting the server.');
  }

  return JWT_SECRET;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain password with a hashed password
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: { userId: string; email: string; role?: string }): string {
  return jwt.sign(payload, requireJwtSecret(), {
    expiresIn: '7d', // Token expires in 7 days
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): { userId: string; email: string; role?: string } | null {
  try {
    const decoded = jwt.verify(token, requireJwtSecret()) as {
      userId: string;
      email: string;
      role?: string;
    };
    return decoded;
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  // More permissive email regex that accepts common email formats
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Requirement: At least 8 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}
