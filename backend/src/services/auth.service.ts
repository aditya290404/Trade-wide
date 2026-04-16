import bcrypt from 'bcryptjs';
import prisma from '../config/db';
import { AppError } from '../utils/AppError';
import { sendOTPEmail } from '../utils/email';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit string
}

export const registerUser = async (data: any) => {
  const { email, passwordRaw, name, contactNumber, alternateEmail } = data;
  const existingUser = await prisma.user.findUnique({ where: { email } });
  
  if (existingUser) {
    if (existingUser.isVerified) {
      throw new AppError('Email already in use', 400);
    } else {
      // Re-register unverified emails
      await prisma.user.delete({ where: { email } });
    }
  }

  const hashedPassword = await bcrypt.hash(passwordRaw, 12);
  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  
  const user = await prisma.user.create({
    data: {
      email,
      name,
      contactNumber,
      alternateEmail,
      password: hashedPassword,
      otpCode,
      otpExpiresAt,
      isVerified: false,
      balance: 100000.0 // Default virtual balance
    }
  });

  // Send the OTP via email
  await sendOTPEmail(email, otpCode);

  return { user, otpCode };
};

export const verifyOtp = async (email: string, otpCode: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);
  
  if (user.isVerified) throw new AppError('User already verified', 400);
  if (user.otpCode !== otpCode) throw new AppError('Invalid OTP', 400);
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) throw new AppError('Expired OTP', 400);

  const verifiedUser = await prisma.user.update({
    where: { email },
    data: {
      isVerified: true,
      otpCode: null,
      otpExpiresAt: null,
    }
  });

  return verifiedUser;
};

export const resendOtp = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError('User not found', 404);
  if (user.isVerified) throw new AppError('User already verified', 400);

  const otpCode = generateOTP();
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { email },
    data: { otpCode, otpExpiresAt }
  });

  // Send the OTP via email
  await sendOTPEmail(email, otpCode);

  return otpCode;
};

export const loginUser = async (email: string, passwordRaw: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user || !(await bcrypt.compare(passwordRaw, user.password))) {
    throw new AppError('Incorrect email or password', 401);
  }

  if (!user.isVerified) {
     throw new AppError('Please verify your email with an OTP first', 403);
  }

  return user;
};

export const updateUser = async (userId: string, data: any) => {
  // We only allow certain fields to be updated via this endpoint
  const { name, contactNumber, alternateEmail } = data;
  
  const updatedUser = await prisma.user.update({
    where: { id: Number(userId) },
    data: {
      name,
      contactNumber,
      alternateEmail
    }
  });

  return updatedUser;
};

export const deleteUser = async (userId: string) => {
  // First, we might need to delete related data if not handled by CASCADE in schema
  // (Assuming cascading deletes or that we want to keep it simple for now)
  await prisma.user.delete({
    where: { id: Number(userId) }
  });
};
