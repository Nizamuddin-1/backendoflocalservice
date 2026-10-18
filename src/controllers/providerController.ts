import { Response } from 'express';
import { AuthRequest } from '../types';
import { AppError } from '../middleware/errorHandler';
import * as providerService from '../services/providerService';
import { handleControllerError } from '../utils/handleControllerError';

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const profile = await providerService.getProviderProfile(userId);
    res.status(200).json({ data: profile, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { name, phone, email, address, bio, languages, bank } = req.body;
    const profile = await providerService.updateProviderProfile(userId, {
      name, phone, email, address, bio, languages, bank,
    });
    res.status(200).json({ data: profile, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const stats = await providerService.getProviderStats(userId);
    res.status(200).json({ data: stats, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getBookings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const filter = req.query.filter as string | undefined;

    const bookings = await providerService.getProviderBookings(userId, filter);
    res.status(200).json({ data: bookings, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getBookingDetail = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const booking = await providerService.getBookingDetail(id);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const acceptBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const booking = await providerService.acceptBooking(id, userId);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const declineBooking = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const booking = await providerService.declineBooking(id, userId);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateJobStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { status } = req.body;
    if (!status) throw new AppError('status is required', 400);

    const booking = await providerService.updateJobStatus(id, userId, status);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const uploadPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { photoUrls } = req.body;

    const booking = await providerService.uploadPhotos(id, userId, photoUrls || []);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getEarnings = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const earnings = await providerService.getEarnings(userId);
    res.status(200).json({ data: earnings, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const toggleAvailability = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const provider = await providerService.toggleAvailability(userId);
    res.status(200).json({ data: provider, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const rateCustomer = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const { rating } = req.body;

    const booking = await providerService.rateCustomer(id, userId, rating);
    res.status(200).json({ data: booking, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getNewRequests = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const requests = await providerService.getNewBookingRequests(userId);
    res.status(200).json({ data: requests, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const generateOtp = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Booking ID is required', 400);

    const result = await providerService.generateBookingOtp(id, userId);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getServices = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const services = await providerService.getProviderServices(userId);
    res.status(200).json({ data: services, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const serviceData = req.body;
    const service = await providerService.createProviderService(userId, serviceData);
    res.status(201).json({ data: service, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Service ID is required', 400);

    const serviceData = req.body;
    const service = await providerService.updateProviderService(userId, id, serviceData);
    res.status(200).json({ data: service, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deactivateService = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Service ID is required', 400);

    const result = await providerService.deactivateService(userId, id);
    res.status(200).json({ data: result, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const createVariation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Service ID is required', 400);

    const variationData = req.body;
    const variation = await providerService.createVariation(userId, id, variationData);
    res.status(201).json({ data: variation, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const updateVariation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Variation ID is required', 400);

    const variationData = req.body;
    const variation = await providerService.updateVariation(userId, id, variationData);
    res.status(200).json({ data: variation, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const deleteVariation = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const { id } = req.params;
    if (!id) throw new AppError('Variation ID is required', 400);

    const result = await providerService.deleteVariation(userId, id);
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

    const result = await providerService.getProviderNotifications(userId, page, limit);
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

    const notification = await providerService.markProviderNotificationRead(userId, id);
    res.status(200).json({ data: notification, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};

export const getReviews = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) throw new AppError('User not authenticated', 401);

    const reviews = await providerService.getProviderReviews(userId);
    res.status(200).json({ data: reviews, error: {} });
  } catch (error) {
    handleControllerError(error, res);
  }
};
