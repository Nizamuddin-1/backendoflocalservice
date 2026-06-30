import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBookingSchema, rescheduleSchema, rateSchema, verifyOtpSchema, cancelSchema } from '../validators/booking';
import { addressSchema, updateAddressSchema, favoriteSchema, disputeSchema } from '../validators/consumer';
import * as consumerController from '../controllers/consumerController';

const router = Router();

router.use(authenticate);

// Stats & Browse
router.get('/stats', consumerController.getStats);
router.get('/categories', consumerController.getCategories);
router.get('/services', consumerController.getServices);
router.get('/services/:id', consumerController.getServiceDetail);

// Bookings
router.get('/bookings', consumerController.getBookings);
router.post('/bookings', validate(createBookingSchema), consumerController.createBooking);
router.put('/bookings/:id/cancel', validate(cancelSchema), consumerController.cancelBooking);
router.put('/bookings/:id/reschedule', validate(rescheduleSchema), consumerController.rescheduleBooking);
router.post('/bookings/:id/rate', validate(rateSchema), consumerController.rateBooking);
router.post('/bookings/:id/verify-otp', validate(verifyOtpSchema), consumerController.verifyOtp);

// Wallet & Transactions
router.get('/transactions', consumerController.getTransactions);
router.get('/wallet', consumerController.getWallet);
router.post('/wallet/add', consumerController.addMoney);

// Promos & Offers & Loyalty
router.get('/promos', consumerController.getPromos);
router.get('/offers', consumerController.getOffers);
router.get('/loyalty', consumerController.getLoyalty);

// Addresses
router.get('/addresses', consumerController.getAddresses);
router.post('/addresses', validate(addressSchema), consumerController.createAddress);
router.put('/addresses/:id', validate(updateAddressSchema), consumerController.updateAddress);
router.delete('/addresses/:id', consumerController.deleteAddress);

// Favorites
router.get('/favorites', consumerController.getFavorites);
router.post('/favorites', validate(favoriteSchema), consumerController.toggleFavorite);

// Notifications
router.get('/notifications', consumerController.getNotifications);
router.put('/notifications/:id/read', consumerController.markNotificationRead);

// Disputes
router.post('/disputes', validate(disputeSchema), consumerController.createDispute);

export default router;
