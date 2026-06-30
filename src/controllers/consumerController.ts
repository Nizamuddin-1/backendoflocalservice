import { Response } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import * as consumerService from '../services/consumerService';
import { handleControllerError } from '../utils/handleControllerError';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const stats = await consumerService.getConsumerStats(userId);
    res.status(200).json({ data: stats, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getCategories = async (_req: AuthRequest, res: Response) => {
  try {
    const categories = await consumerService.getCategories();
    res.status(200).json({ data: categories, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getServices = async (req: AuthRequest, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const sort = req.query.sort as string | undefined;
    const minRating = req.query.minRating ? Number(req.query.minRating) : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const verified = req.query.verified === 'true';

    const services = await consumerService.getServices({
      category, search, sort, minRating, maxPrice, verified,
    });
    res.status(200).json({ data: services, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getServiceDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Service ID is required', 400);

    const service = await consumerService.getServiceDetail(id);
    res.status(200).json({ data: service, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const status = req.query.status as string | undefined;

    const bookings = await consumerService.getConsumerBookings(userId, status);
    res.status(200).json({ data: bookings, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const bookingData = req.body;
    const booking = await consumerService.createBooking(userId, bookingData);
    res.status(201).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const cancelBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { reason } = req.body;

    const booking = await consumerService.cancelBooking(id, userId, reason);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const rescheduleBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { newScheduledAt } = req.body;
    if (!newScheduledAt) throw new AppError('newScheduledAt is required', 400);

    const booking = await consumerService.rescheduleBooking(id, userId, newScheduledAt);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const rateBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { rating, comment, title } = req.body;

    const result = await consumerService.rateBooking(id, userId, rating, comment, title);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const verifyOtp = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { otp } = req.body;
    if (!otp) throw new AppError('otp is required', 400);

    const booking = await consumerService.verifyOtp(id, userId, otp);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const filter = req.query.filter as string | undefined;

    const txns = await consumerService.getTransactions(userId, filter);
    res.status(200).json({ data: txns, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getWallet = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const wallet = await consumerService.getWalletInfo(userId);
    res.status(200).json({ data: wallet, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const addMoney = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { amount } = req.body;
    if (!amount || amount <= 0) throw new AppError('Valid amount is required', 400);

    const wallet = await consumerService.addMoney(userId, amount);
    res.status(200).json({ data: wallet, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getPromos = async (_req: AuthRequest, res: Response) => {
  try {
    const promos = await consumerService.getPromos();
    res.status(200).json({ data: promos, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getOffers = async (_req: AuthRequest, res: Response) => {
  try {
    const offers = await consumerService.getOffers();
    res.status(200).json({ data: offers, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getLoyalty = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const loyalty = await consumerService.getLoyaltyInfo(userId);
    res.status(200).json({ data: loyalty, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getAddresses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const addresses = await consumerService.getAddresses(userId);
    res.status(200).json({ data: addresses, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const addressData = req.body;
    const address = await consumerService.createAddress(userId, addressData);
    res.status(201).json({ data: address, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Address ID is required', 400);

    const addressData = req.body;
    const address = await consumerService.updateAddress(userId, id, addressData);
    res.status(200).json({ data: address, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Address ID is required', 400);

    const result = await consumerService.deleteAddress(userId, id);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getFavorites = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const favorites = await consumerService.getFavorites(userId);
    res.status(200).json({ data: favorites, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const favoriteData = req.body;
    const result = await consumerService.toggleFavorite(userId, favoriteData);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await consumerService.getNotifications(userId, page, limit);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Notification ID is required', 400);

    const notification = await consumerService.markNotificationRead(userId, id);
    res.status(200).json({ data: notification, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createDispute = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const disputeData = req.body;
    const dispute = await consumerService.createDispute(userId, disputeData);
    res.status(201).json({ data: dispute, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};
