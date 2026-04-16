import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as authService from '../services/auth.service';
import prisma from '../config/db';
import bcrypt from 'bcryptjs';

vi.mock('../config/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn().mockResolvedValue('hashed_password'),
    compare: vi.fn(),
  },
}));

vi.mock('../utils/email', () => ({
  sendOTPEmail: vi.fn().mockResolvedValue(true),
}));

describe('Auth Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateOTP', () => {
    it('should generate a 6-digit string', () => {
      const otp = authService.generateOTP();
      expect(otp).toHaveLength(6);
      expect(Number(otp)).toBeGreaterThanOrEqual(100000);
    });
  });

  describe('registerUser', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        passwordRaw: 'password123',
        name: 'Test Member',
        contactNumber: '1234567890',
      };

      (prisma.user.findUnique as any).mockResolvedValue(null);
      (prisma.user.create as any).mockResolvedValue({
        id: 1,
        email: userData.email,
        name: userData.name,
      });

      const result = await authService.registerUser(userData);

      expect(prisma.user.create).toHaveBeenCalled();
      expect(result.user.email).toBe(userData.email);
      expect(result.otpCode).toHaveLength(6);
    });

    it('should throw error if email already exists and is verified', async () => {
      (prisma.user.findUnique as any).mockResolvedValue({
        email: 'test@example.com',
        isVerified: true,
      });

      await expect(authService.registerUser({ email: 'test@example.com' }))
        .rejects.toThrow('Email already in use');
    });
  });
});
