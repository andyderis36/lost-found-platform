import { describe, it, expect } from 'vitest';
import { isValidPassword, isValidEmail } from './auth';

describe('Auth Library', () => {
  describe('isValidPassword', () => {
    it('should return false for passwords shorter than 8 characters', () => {
      expect(isValidPassword('1234567')).toBe(false);
    });

    it('should return true for any password with at least 8 characters', () => {
      expect(isValidPassword('12345678')).toBe(true);
      expect(isValidPassword('password')).toBe(true);
      expect(isValidPassword('abcdefgh')).toBe(true);
    });
  });

  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@sub.domain.co.id')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('test@')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('test')).toBe(false);
    });
  });
});
