import { Response } from 'express';
import { AuthRequest } from '../types';
import * as providerService from '../services/providerService';
import { asyncHandler } from '../utils/asyncHandler';

export const getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await providerService.getProviderProfile(req.user!.userId);
  res.json(profile);
});

export const updateProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
  const profile = await providerService.updateProviderProfile(req.user!.userId, req.body);
  res.json(profile);
});

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await providerService.getProviderStats(req.user!.userId);
  res.json(stats);
});

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookings = await providerService.getProviderBookings(
    req.user!.userId,
    req.query.filter as string
  );
  res.json(bookings);
});

export const getBookingDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await providerService.getBookingDetail(req.params.id);
  res.json(booking);
});

export const acceptBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await providerService.acceptBooking(req.params.id, req.user!.userId);
  res.json(booking);
});

export const declineBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await providerService.declineBooking(req.params.id, req.user!.userId);
  res.json(booking);
});

export const updateJobStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { status } = req.body;
  const booking = await providerService.updateJobStatus(req.params.id, req.user!.userId, status);
  res.json(booking);
});

export const uploadPhotos = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { photoUrls } = req.body;
  const booking = await providerService.uploadPhotos(req.params.id, req.user!.userId, photoUrls || []);
  res.json(booking);
});

export const getEarnings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const earnings = await providerService.getEarnings(req.user!.userId);
  res.json(earnings);
});

export const toggleAvailability = asyncHandler(async (req: AuthRequest, res: Response) => {
  const provider = await providerService.toggleAvailability(req.user!.userId);
  res.json(provider);
});

export const rateCustomer = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating } = req.body;
  const booking = await providerService.rateCustomer(req.params.id, req.user!.userId, rating);
  res.json(booking);
});

export const getNewRequests = asyncHandler(async (req: AuthRequest, res: Response) => {
  const requests = await providerService.getNewBookingRequests(req.user!.userId);
  res.json(requests);
});

export const generateOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await providerService.generateBookingOtp(req.params.id, req.user!.userId);
  res.json(result);
});

export const getServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const services = await providerService.getProviderServices(req.user!.userId);
  res.json(services);
});

export const createService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await providerService.createProviderService(req.user!.userId, req.body);
  res.status(201).json(service);
});

export const updateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await providerService.updateProviderService(req.user!.userId, req.params.id, req.body);
  res.json(service);
});

export const deactivateService = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await providerService.deactivateService(req.user!.userId, req.params.id);
  res.json(result);
});

export const createVariation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const variation = await providerService.createVariation(req.user!.userId, req.params.id, req.body);
  res.status(201).json(variation);
});

export const updateVariation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const variation = await providerService.updateVariation(req.user!.userId, req.params.id, req.body);
  res.json(variation);
});

export const deleteVariation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await providerService.deleteVariation(req.user!.userId, req.params.id);
  res.json(result);
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await providerService.getProviderNotifications(req.user!.userId, page, limit);
  res.json(result);
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await providerService.markProviderNotificationRead(req.user!.userId, req.params.id);
  res.json(notification);
});

export const getReviews = asyncHandler(async (req: AuthRequest, res: Response) => {
  const reviews = await providerService.getProviderReviews(req.user!.userId);
  res.json(reviews);
});
