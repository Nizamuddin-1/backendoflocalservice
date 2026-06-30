import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as authService from '../services/authService';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body);
  res.status(201).json(result);
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.loginUser(email, password);
  res.json(result);
});

export const refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshTokens(refreshToken);
  res.json(tokens);
});

export const logout = asyncHandler(async (req: AuthRequest, res: Response) => {
  await authService.logoutUser(req.user!.userId);
  res.json({ message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await authService.getProfile(req.user!.userId);
  res.json(profile);
});

export const updateMe = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = await authService.updateProfile(req.user!.userId, req.body);
  res.json(user);
});
