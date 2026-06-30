import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  updateProviderProfileSchema, createServiceSchema, updateServiceSchema,
  variationSchema, updateVariationSchema, jobStatusSchema, rateCustomerSchema,
} from '../validators/provider';
import * as providerController from '../controllers/providerController';

const router = Router();

router.use(authenticate);
router.use(requireRole('provider'));

// Profile
router.get('/profile', providerController.getProfile);
router.put('/profile', validate(updateProviderProfileSchema), providerController.updateProfile);

// Stats & Earnings
router.get('/stats', providerController.getStats);
router.get('/earnings', providerController.getEarnings);

// Bookings
router.get('/bookings', providerController.getBookings);
router.get('/bookings/new', providerController.getNewRequests);
router.get('/bookings/:id', providerController.getBookingDetail);
router.put('/bookings/:id/accept', providerController.acceptBooking);
router.put('/bookings/:id/decline', providerController.declineBooking);
router.put('/bookings/:id/status', validate(jobStatusSchema), providerController.updateJobStatus);
router.post('/bookings/:id/photos', providerController.uploadPhotos);
router.post('/bookings/:id/otp', providerController.generateOtp);
router.post('/bookings/:id/rate-customer', validate(rateCustomerSchema), providerController.rateCustomer);

// Service Management
router.get('/services', providerController.getServices);
router.post('/services', validate(createServiceSchema), providerController.createService);
router.put('/services/:id', validate(updateServiceSchema), providerController.updateService);
router.delete('/services/:id', providerController.deactivateService);

// Variations
router.post('/services/:id/variations', validate(variationSchema), providerController.createVariation);
router.put('/services/variations/:id', validate(updateVariationSchema), providerController.updateVariation);
router.delete('/services/variations/:id', providerController.deleteVariation);

// Availability
router.put('/availability', providerController.toggleAvailability);

// Notifications
router.get('/notifications', providerController.getNotifications);
router.put('/notifications/:id/read', providerController.markNotificationRead);

// Reviews
router.get('/reviews', providerController.getReviews);

export default router;
