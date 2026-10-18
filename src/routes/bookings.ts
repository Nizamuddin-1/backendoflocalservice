import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { bookingLimiter } from '../middleware/rateLimiter';
import { createBookingSchema } from '../validators/booking';
import { jobStatusSchema } from '../validators/provider';
import * as consumerController from '../controllers/consumerController';
import * as providerController from '../controllers/providerController';

const router = Router();

router.use(authenticate);

// Consumer booking endpoints
router.post('/', bookingLimiter, validate(createBookingSchema), consumerController.createBooking);
router.get('/consumer', consumerController.getBookings);

// Provider booking endpoints
router.get('/provider', providerController.getBookings);
router.patch('/:id/status', validate(jobStatusSchema), providerController.updateJobStatus);
router.put('/:id/status', validate(jobStatusSchema), providerController.updateJobStatus);
router.put('/:id/accept', providerController.acceptBooking);
router.put('/:id/decline', providerController.declineBooking);

export default router;
