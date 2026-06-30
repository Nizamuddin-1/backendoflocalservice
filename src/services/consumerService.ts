import {
  Service, ServiceCategory, Booking, Transaction, Wallet, Promo, Offer, User,
  ServiceVariation, Review, Address, Favorite, Dispute, Notification,
} from '../models';
import { AppError } from '../middleware/errorHandler';
import { generateBookingRef, generateRequestNo } from '../utils/generateBookingRef';

export async function getConsumerStats(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const bookings = await Booking.find({ consumerId: userId });
  const wallet = await Wallet.findOne({ userId });
  const activeBookings = bookings.filter((b) => b.status === 'upcoming' || b.status === 'ongoing').length;
  const completedBookings = bookings.filter((b) => b.status === 'completed').length;

  return {
    bookingsDone: completedBookings,
    totalSaved: user.totalSpent,
    walletBalance: wallet?.balance || 0,
    loyaltyPoints: user.loyaltyPoints,
    avgRating: 4.8,
    activeOffers: activeBookings,
  };
}

export async function getCategories() {
  return ServiceCategory.find({ isActive: true }).lean();
}

export async function getServices(query: {
  category?: string;
  search?: string;
  sort?: string;
  minRating?: number;
  maxPrice?: number;
  verified?: boolean;
}) {
  const filter: any = { isActive: true };

  if (query.category && query.category !== 'all') {
    const cat = await ServiceCategory.findOne({ name: { $regex: query.category, $options: 'i' } });
    if (cat) filter.categoryId = cat._id;
  }

  if (query.search) {
    filter.$or = [
      { name: { $regex: query.search, $options: 'i' } },
      { provider: { $regex: query.search, $options: 'i' } },
    ];
  }

  if (query.minRating) {
    filter.rating = { $gte: query.minRating };
  }

  if (query.maxPrice) {
    filter.price = { $lte: query.maxPrice };
  }

  if (query.verified) {
    filter.verified = true;
  }

  let sortOption: Record<string, 1 | -1> = { reviews: -1 };
  if (query.sort === 'price') sortOption = { price: 1 };
  else if (query.sort === 'rating') sortOption = { rating: -1 };
  else if (query.sort === 'newest') sortOption = { createdAt: -1 };

  return Service.find(filter).sort(sortOption).lean();
}

export async function getServiceDetail(serviceId: string): Promise<Record<string, unknown>> {
  const service = await Service.findById(serviceId).lean();
  if (!service) throw new AppError('Service not found', 404);

  const variations = await ServiceVariation.find({ serviceId }).lean();
  return { ...(service as Record<string, unknown>), variations };
}

export async function getConsumerBookings(userId: string, status?: string) {
  const filter: Record<string, unknown> = { consumerId: userId };
  if (status && status !== 'all') {
    filter.status = status;
  }
  return Booking.find(filter).sort({ scheduledAt: -1 }).lean();
}

export async function createBooking(userId: string, data: {
  serviceId: string;
  variationId?: string;
  scheduledAt: string;
  address: string;
  city?: string;
}) {
  const service = await Service.findById(data.serviceId);
  if (!service) throw new AppError('Service not found', 404);

  let price = service.price;
  let variantId;

  if (data.variationId) {
    const variation = await ServiceVariation.findById(data.variationId);
    if (variation && variation.serviceId.toString() === data.serviceId) {
      price = variation.price;
      variantId = variation._id;
    }
  }

  const scheduledDate = new Date(data.scheduledAt);
  const dateStr = scheduledDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = scheduledDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const booking = await Booking.create({
    consumerId: userId,
    requestNo: await generateRequestNo(),
    customer: {
      name: user.name,
      initials: user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase(),
      rating: 0,
      totalOrders: user.bookingsCount,
      phone: user.phone,
    },
    serviceType: service.categoryLabel,
    serviceName: service.name,
    services: [{ name: service.name, quantity: 1, price }],
    location: { address: data.address, city: data.city || '', distanceKm: 0, etaMins: 15 },
    scheduledAt: scheduledDate,
    durationMins: 60,
    timeSlot: `${timeStr} – ${new Date(scheduledDate.getTime() + 60 * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`,
    address: data.address,
    payment: 'prepaid',
    totalAmount: price,
    price,
    isPaid: false,
    bookingRef: await generateBookingRef(),
    mcIcon: service.mcIcon,
    color: service.accentColor,
    bg: service.accentBg,
    accentColor: service.accentColor,
    category: service.categoryLabel,
    canReschedule: true,
    canCancel: true,
    canReview: false,
    canTrack: false,
    proAvatar: service.providerInitials,
    providerName: service.provider,
    initials: service.providerInitials,
    date: dateStr,
    time: timeStr,
    steps: [
      { label: 'Booking Confirmed', detail: 'Your booking has been confirmed.', state: 'done' },
      { label: 'Professional En Route', detail: 'Professional is on the way.', state: 'pending' },
      { label: 'Service In Progress', detail: 'Service has started.', state: 'pending' },
      { label: 'Service Completed', detail: 'Service has been completed.', state: 'pending' },
      { label: 'Payment Processed', detail: 'Payment has been processed.', state: 'pending' },
    ],
    photos: [],
    otpVerified: false,
  });

  user.bookingsCount += 1;
  await user.save();

  return booking;
}

export async function cancelBooking(bookingId: string, userId: string, reason?: string) {
  const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    throw new AppError('Booking cannot be cancelled', 400);
  }

  booking.status = 'cancelled';
  booking.canCancel = false;
  booking.canReschedule = false;
  booking.cancelledAt = new Date();
  if (reason) booking.cancelReason = reason;
  await booking.save();

  return booking;
}

export async function rescheduleBooking(bookingId: string, userId: string, newScheduledAt: string) {
  const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
  if (!booking) throw new AppError('Booking not found', 404);
  if (!booking.canReschedule) throw new AppError('Booking cannot be rescheduled', 400);

  const newDate = new Date(newScheduledAt);
  const dateStr = newDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = newDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  booking.scheduledAt = newDate;
  booking.date = dateStr;
  booking.time = timeStr;
  booking.timeSlot = `${timeStr} – ${new Date(newDate.getTime() + (booking.durationMins || 60) * 60 * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  await booking.save();

  return booking;
}

export async function rateBooking(bookingId: string, userId: string, rating: number, comment?: string, title?: string) {
  const booking = await Booking.findOne({ _id: bookingId, consumerId: userId }).populate('providerId');
  if (!booking) throw new AppError('Booking not found', 404);
  if (booking.status !== 'completed') throw new AppError('Can only rate completed bookings', 400);
  if (!booking.providerId) throw new AppError('No provider assigned to this booking', 400);

  const review = await Review.create({
    bookingId: booking._id,
    consumerId: userId,
    providerId: booking.providerId,
    serviceId: booking.serviceVariantId || booking.providerId,
    rating,
    title: title || '',
    comment: comment || '',
    isVerified: true,
  });

  booking.rating = rating;
  booking.canReview = false;
  booking.reviewId = review._id;
  await booking.save();

  await Notification.create({
    userId: (booking.providerId as any).userId,
    type: 'review',
    title: 'New Review Received',
    body: `You received a ${rating}-star review`,
    data: { bookingId: booking._id, reviewId: review._id, rating },
  });

  return { booking, review };
}

export async function generateOtp(bookingId: string, userId: string) {
  const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
  if (!booking) throw new AppError('Booking not found', 404);

  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  booking.otp = otp;
  booking.otpVerified = false;
  await booking.save();

  return { otp };
}

export async function verifyOtp(bookingId: string, userId: string, otp: string) {
  const booking = await Booking.findOne({ _id: bookingId, consumerId: userId });
  if (!booking) throw new AppError('Booking not found', 404);
  if (!booking.otp) throw new AppError('No OTP generated for this booking', 400);
  if (booking.otpVerified) throw new AppError('OTP already verified', 400);
  if (booking.otp !== otp) throw new AppError('Invalid OTP', 400);

  booking.otpVerified = true;
  booking.otp = undefined;
  booking.status = 'ongoing';
  await booking.save();

  return booking;
}

export async function getTransactions(userId: string, dateFilter?: string) {
  const filter: Record<string, unknown> = { userId };
  if (dateFilter && dateFilter !== 'all') {
    filter.date = { $regex: dateFilter, $options: 'i' };
  }
  return Transaction.find(filter).sort({ createdAt: -1 }).lean();
}

export async function getWalletInfo(userId: string) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new AppError('Wallet not found', 404);

  const transactions = await Transaction.find({ userId }).sort({ createdAt: -1 }).limit(50).lean();
  const totalSpent = transactions.filter((t) => t.type === 'debit').reduce((s, t) => s + t.amount, 0);

  return {
    balance: wallet.balance,
    holdBalance: wallet.holdBalance,
    totalAdded: wallet.totalAdded,
    totalCashback: wallet.totalCashback,
    totalSpent,
  };
}

export async function addMoney(userId: string, amount: number) {
  const wallet = await Wallet.findOne({ userId });
  if (!wallet) throw new AppError('Wallet not found', 404);

  wallet.balance += amount;
  wallet.totalAdded += amount;
  await wallet.save();

  await Transaction.create({
    userId,
    title: 'Added to Wallet',
    subtitle: `Added ₹${amount} to wallet`,
    amount,
    type: 'credit',
    status: 'success',
    date: 'Today',
    time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    icon: 'bank-transfer-in',
    iconColor: '#10B981',
  });

  return wallet;
}

export async function getPromos() {
  return Promo.find({ isActive: true }).lean();
}

export async function getOffers() {
  return Offer.find({ isActive: true }).lean();
}

export async function getLoyaltyInfo(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);

  const bookings = await Booking.find({ consumerId: userId, status: 'completed' });
  const totalSpent = bookings.reduce((s, b) => s + b.price, 0);

  const rewards = [
    { id: 'r1', label: '₹50 Off', pts: 500 },
    { id: 'r2', label: 'Free Visit', pts: 800 },
    { id: 'r3', label: 'Priority Slot', pts: 1000 },
    { id: 'r4', label: '₹200 Off', pts: 1500 },
  ];

  return {
    points: user.loyaltyPoints,
    tier: user.tier,
    totalSpent,
    bookingsCount: bookings.length,
    pointsToNextTier: user.tier === 'Silver' ? 2000 : user.tier === 'Gold' ? 5000 : 0,
    nextTier: user.tier === 'Silver' ? 'Gold' : user.tier === 'Gold' ? 'Platinum' : null,
    rewards,
  };
}

// ── Addresses ──────────────────────────────────────────────────────────────

export async function getAddresses(userId: string) {
  return Address.find({ userId }).lean();
}

export async function createAddress(userId: string, data: {
  label: string; fullAddress: string; city: string; pincode: string; coordinates?: any; isDefault?: boolean;
}) {
  const address = await Address.create({ ...data, userId });

  if (data.isDefault) {
    await Address.updateMany({ userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }

  await User.findByIdAndUpdate(userId, { $push: { savedAddresses: address._id } });
  return address;
}

export async function updateAddress(userId: string, addressId: string, data: any) {
  const address = await Address.findOneAndUpdate(
    { _id: addressId, userId },
    { $set: data },
    { new: true }
  );
  if (!address) throw new AppError('Address not found', 404);

  if (data.isDefault) {
    await Address.updateMany({ userId, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }

  return address;
}

export async function deleteAddress(userId: string, addressId: string) {
  const address = await Address.findOneAndDelete({ _id: addressId, userId });
  if (!address) throw new AppError('Address not found', 404);

  await User.findByIdAndUpdate(userId, { $pull: { savedAddresses: addressId } });
  return { message: 'Address deleted' };
}

// ── Favorites ──────────────────────────────────────────────────────────────

export async function getFavorites(userId: string) {
  const favorites = await Favorite.find({ userId }).populate('serviceId').lean();
  return favorites.filter((f) => f.serviceId).map((f) => f.serviceId);
}

export async function toggleFavorite(userId: string, data: { serviceId?: string; providerId?: string }) {
  const existing = await Favorite.findOne({
    userId,
    ...(data.serviceId ? { serviceId: data.serviceId } : {}),
    ...(data.providerId ? { providerId: data.providerId } : {}),
  });

  if (existing) {
    await existing.deleteOne();
    return { favorited: false };
  }

  await Favorite.create({ userId, ...data });
  return { favorited: true };
}

// ── Disputes ────────────────────────────────────────────────────────────────

export async function createDispute(userId: string, data: { bookingId: string; reason: string; description: string }) {
  const booking = await Booking.findById(data.bookingId);
  if (!booking) throw new AppError('Booking not found', 404);

  const dispute = await Dispute.create({
    bookingId: data.bookingId,
    raisedBy: userId,
    raisedAgainst: booking.providerId || userId,
    reason: data.reason,
    description: data.description,
  });

  return dispute;
}

// ── Notifications ──────────────────────────────────────────────────────────

export async function getNotifications(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Notification.countDocuments({ userId }),
  ]);
  return { notifications, total, page, totalPages: Math.ceil(total / limit) };
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { $set: { isRead: true } },
    { new: true }
  );
  if (!notification) throw new AppError('Notification not found', 404);
  return notification;
}
