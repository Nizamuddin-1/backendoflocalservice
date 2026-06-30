import { Request, Response } from 'express';
import { User, Provider, Booking, Dispute, Promo, Offer } from '../models';
import { asyncHandler } from '../utils/asyncHandler';

export const getUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await User.find().select('-password -refreshToken').sort({ createdAt: -1 }).lean();
  res.json(users);
});

export const getProviders = asyncHandler(async (_req: Request, res: Response) => {
  const providers = await Provider.find().populate('userId', 'name email phone').sort({ createdAt: -1 }).lean();
  res.json(providers);
});

export const getBookings = asyncHandler(async (req: Request, res: Response) => {
  const { status, page = '1', limit = '50' } = req.query;
  const filter: Record<string, unknown> = {};
  if (status && status !== 'all') filter.status = status;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
  const [bookings, total] = await Promise.all([
    Booking.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit as string)).lean(),
    Booking.countDocuments(filter),
  ]);
  res.json({ bookings, total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) });
});

export const getDisputes = asyncHandler(async (_req: Request, res: Response) => {
  const disputes = await Dispute.find().sort({ createdAt: -1 }).lean();
  res.json(disputes);
});

export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  const { status, resolution } = req.body;
  const dispute = await Dispute.findByIdAndUpdate(
    req.params.id,
    { $set: { status, resolution } },
    { new: true }
  );
  if (!dispute) {
    res.status(404).json({ error: 'Dispute not found' });
    return;
  }
  res.json(dispute);
});

export const getPlatformStats = asyncHandler(async (_req: Request, res: Response) => {
  const [totalUsers, totalProviders, totalBookings, totalRevenue] = await Promise.all([
    User.countDocuments(),
    Provider.countDocuments(),
    Booking.countDocuments(),
    Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);
  res.json({
    totalUsers,
    totalProviders,
    totalBookings,
    totalRevenue: totalRevenue[0]?.total || 0,
  });
});

export const createPromo = asyncHandler(async (req: Request, res: Response) => {
  const promo = await Promo.create(req.body);
  res.status(201).json(promo);
});

export const updatePromo = asyncHandler(async (req: Request, res: Response) => {
  const promo = await Promo.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!promo) {
    res.status(404).json({ error: 'Promo not found' });
    return;
  }
  res.json(promo);
});

export const deletePromo = asyncHandler(async (req: Request, res: Response) => {
  const promo = await Promo.findByIdAndDelete(req.params.id);
  if (!promo) {
    res.status(404).json({ error: 'Promo not found' });
    return;
  }
  res.json({ message: 'Promo deleted' });
});

export const createOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await Offer.create(req.body);
  res.status(201).json(offer);
});

export const updateOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
  if (!offer) {
    res.status(404).json({ error: 'Offer not found' });
    return;
  }
  res.json(offer);
});

export const deleteOffer = asyncHandler(async (req: Request, res: Response) => {
  const offer = await Offer.findByIdAndDelete(req.params.id);
  if (!offer) {
    res.status(404).json({ error: 'Offer not found' });
    return;
  }
  res.json({ message: 'Offer deleted' });
});
