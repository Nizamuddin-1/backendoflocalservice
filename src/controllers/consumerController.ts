import { Response } from 'express';
import { AuthRequest } from '../types';
import * as consumerService from '../services/consumerService';
import { asyncHandler } from '../utils/asyncHandler';

export const getStats = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stats = await consumerService.getConsumerStats(req.user!.userId);
  res.json(stats);
});

export const getCategories = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const categories = await consumerService.getCategories();
  res.json(categories);
});

export const getServices = asyncHandler(async (req: AuthRequest, res: Response) => {
  const services = await consumerService.getServices({
    category: req.query.category as string,
    search: req.query.search as string,
    sort: req.query.sort as string,
    minRating: req.query.minRating ? Number(req.query.minRating) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    verified: req.query.verified === 'true',
  });
  res.json(services);
});

export const getServiceDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const service = await consumerService.getServiceDetail(req.params.id);
  res.json(service);
});

export const getBookings = asyncHandler(async (req: AuthRequest, res: Response) => {
  const bookings = await consumerService.getConsumerBookings(
    req.user!.userId,
    req.query.status as string
  );
  res.json(bookings);
});

export const createBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await consumerService.createBooking(req.user!.userId, req.body);
  res.status(201).json(booking);
});

export const cancelBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await consumerService.cancelBooking(
    req.params.id,
    req.user!.userId,
    req.body.reason
  );
  res.json(booking);
});

export const rescheduleBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await consumerService.rescheduleBooking(
    req.params.id,
    req.user!.userId,
    req.body.newScheduledAt
  );
  res.json(booking);
});

export const rateBooking = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { rating, comment, title } = req.body;
  const result = await consumerService.rateBooking(
    req.params.id,
    req.user!.userId,
    rating,
    comment,
    title
  );
  res.json(result);
});

export const verifyOtp = asyncHandler(async (req: AuthRequest, res: Response) => {
  const booking = await consumerService.verifyOtp(
    req.params.id,
    req.user!.userId,
    req.body.otp
  );
  res.json(booking);
});

export const getTransactions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const txns = await consumerService.getTransactions(
    req.user!.userId,
    req.query.filter as string
  );
  res.json(txns);
});

export const getWallet = asyncHandler(async (req: AuthRequest, res: Response) => {
  const wallet = await consumerService.getWalletInfo(req.user!.userId);
  res.json(wallet);
});

export const addMoney = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { amount } = req.body;
  const wallet = await consumerService.addMoney(req.user!.userId, amount);
  res.json(wallet);
});

export const getPromos = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const promos = await consumerService.getPromos();
  res.json(promos);
});

export const getOffers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const offers = await consumerService.getOffers();
  res.json(offers);
});

export const getLoyalty = asyncHandler(async (req: AuthRequest, res: Response) => {
  const loyalty = await consumerService.getLoyaltyInfo(req.user!.userId);
  res.json(loyalty);
});

export const getAddresses = asyncHandler(async (req: AuthRequest, res: Response) => {
  const addresses = await consumerService.getAddresses(req.user!.userId);
  res.json(addresses);
});

export const createAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const address = await consumerService.createAddress(req.user!.userId, req.body);
  res.status(201).json(address);
});

export const updateAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const address = await consumerService.updateAddress(req.user!.userId, req.params.id, req.body);
  res.json(address);
});

export const deleteAddress = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await consumerService.deleteAddress(req.user!.userId, req.params.id);
  res.json(result);
});

export const getFavorites = asyncHandler(async (req: AuthRequest, res: Response) => {
  const favorites = await consumerService.getFavorites(req.user!.userId);
  res.json(favorites);
});

export const toggleFavorite = asyncHandler(async (req: AuthRequest, res: Response) => {
  const result = await consumerService.toggleFavorite(req.user!.userId, req.body);
  res.json(result);
});

export const getNotifications = asyncHandler(async (req: AuthRequest, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const result = await consumerService.getNotifications(req.user!.userId, page, limit);
  res.json(result);
});

export const markNotificationRead = asyncHandler(async (req: AuthRequest, res: Response) => {
  const notification = await consumerService.markNotificationRead(
    req.user!.userId,
    req.params.id
  );
  res.json(notification);
});

export const createDispute = asyncHandler(async (req: AuthRequest, res: Response) => {
  const dispute = await consumerService.createDispute(req.user!.userId, req.body);
  res.status(201).json(dispute);
});
