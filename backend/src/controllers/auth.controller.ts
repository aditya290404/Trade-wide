import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { catchAsync } from '../utils/catchAsync';
import { registerUser, loginUser, verifyOtp as verifyService, resendOtp as resendService, updateUser, deleteUser } from '../services/auth.service';
import { AuthRequest } from '../middleware/auth';
import { signToken } from '../utils/jwt';

const authRegisterSchema = z.object({
  name: z.string().min(2),
  contactNumber: z.string().min(10),
  alternateEmail: z.string().email().optional().or(z.literal('')),
  email: z.string().email(),
  password: z.string().min(6)
});

const authLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otpCode: z.string().length(6)
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  contactNumber: z.string().min(10).optional(),
  alternateEmail: z.string().email().optional().or(z.literal(''))
});

export const register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const data = authRegisterSchema.parse(req.body);
  
  const { user, otpCode } = await registerUser({
    ...data,
    passwordRaw: data.password // Map it for the service
  });
  
  // Success response
  res.status(201).json({
    status: 'success',
    message: 'Registration successful! Verification code sent to your email.',
    data: {
      user: { id: user.id, email: user.email }
    }
  });
});

export const verifyOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, otpCode } = verifyOtpSchema.parse(req.body);
  
  const user = await verifyService(email, otpCode);
  const token = signToken(user.id);
  
  user.password = undefined as any;
  user.otpCode = undefined as any;

  res.status(200).json({
    status: 'success',
    message: 'Email Verified Successfully',
    token,
    data: { user }
  });
});

export const resendOtp = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email } = z.object({ email: z.string().email() }).parse(req.body);
  
  const otpCode = await resendService(email);
  
  res.status(200).json({
    status: 'success',
    message: 'Verification code resent. Please check your inbox.',
  });
});

export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = authLoginSchema.parse(req.body);

  const user = await loginUser(email, password);
  const token = signToken(user.id);

  user.password = undefined as any;

  res.status(200).json({
    status: 'success',
    token,
    data: { user }
  });
});

export const getMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const user = req.user;
  user.password = undefined;

  res.status(200).json({
    status: 'success',
    data: { user }
  });
});

export const updateMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  const data = updateProfileSchema.parse(req.body);
  const updatedUser = await updateUser(req.user.id.toString(), data);
  
  updatedUser.password = undefined as any;

  res.status(200).json({
    status: 'success',
    message: 'Profile updated successfully',
    data: { user: updatedUser }
  });
});

export const deleteMe = catchAsync(async (req: AuthRequest, res: Response, next: NextFunction) => {
  await deleteUser(req.user.id.toString());

  res.status(204).json({
    status: 'success',
    data: null
  });
});
