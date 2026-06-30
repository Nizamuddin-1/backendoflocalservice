import { Response } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import * as adminService from '../services/adminService';
import { handleControllerError } from '../utils/handleControllerError';

export const getUsers = async (_req: AuthRequest, res: Response) => {
  try {
    const users = await adminService.getUsers();
    res.status(200).json({ data: users, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getProviders = async (_req: AuthRequest, res: Response) => {
  try {
    const providers = await adminService.getProviders();
    res.status(200).json({ data: providers, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await adminService.getBookings(status, page, limit);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getDisputes = async (_req: AuthRequest, res: Response) => {
  try {
    const disputes = await adminService.getDisputes();
    res.status(200).json({ data: disputes, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const resolveDispute = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Dispute ID is required', 400);

    const { status, resolution } = req.body;
    if (!status || !resolution) throw new AppError('status and resolution are required', 400);

    const dispute = await adminService.resolveDispute(id, status, resolution);
    res.status(200).json({ data: dispute, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getPlatformStats = async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await adminService.getPlatformStats();
    res.status(200).json({ data: stats, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createPromo = async (req: AuthRequest, res: Response) => {
  try {
    const promoData = req.body;
    const promo = await adminService.createPromo(promoData);
    res.status(201).json({ data: promo, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updatePromo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Promo ID is required', 400);

    const promoData = req.body;
    const promo = await adminService.updatePromo(id, promoData);
    res.status(200).json({ data: promo, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deletePromo = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Promo ID is required', 400);

    const result = await adminService.deletePromo(id);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const offerData = req.body;
    const offer = await adminService.createOffer(offerData);
    res.status(201).json({ data: offer, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Offer ID is required', 400);

    const offerData = req.body;
    const offer = await adminService.updateOffer(id, offerData);
    res.status(200).json({ data: offer, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deleteOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Offer ID is required', 400);

    const result = await adminService.deleteOffer(id);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};
