import { Response } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import * as authService from '../services/authService';
import { handleControllerError } from '../utils/handleControllerError';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, phone, password, role } = req.body;
    if (!name || !email || !phone || !password || !role) {
      throw new AppError('name, email, phone, password, and role are required', 400);
    }
    const result = await authService.registerUser({ name, email, phone, password, role });
    res.status(201).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new AppError('email and password are required', 400);
    }
    const result = await authService.loginUser(email, password);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const refresh = async (req: AuthRequest, res: Response) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw new AppError('refreshToken is required', 400);
    }
    const tokens = await authService.refreshTokens(refreshToken);
    res.status(200).json({ data: tokens, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const logout = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    await authService.logoutUser(userId);
    res.status(200).json({ data: { message: 'Logged out successfully' }, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const profile = await authService.getProfile(userId);
    res.status(200).json({ data: profile, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateMe = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { name, phone, email, location, avatar } = req.body;
    const user = await authService.updateProfile(userId, { name, phone, email, location, avatar });
    res.status(200).json({ data: user, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};
