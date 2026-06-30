import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createPromoSchema,
  updatePromoSchema,
  createOfferSchema,
  updateOfferSchema,
  resolveDisputeSchema,
} from '../validators/admin';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', adminController.getUsers);
router.get('/providers', adminController.getProviders);
router.get('/bookings', adminController.getBookings);
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id', validate(resolveDisputeSchema), adminController.resolveDispute);
router.get('/stats', adminController.getPlatformStats);

router.post('/promos', validate(createPromoSchema), adminController.createPromo);
router.put('/promos/:id', validate(updatePromoSchema), adminController.updatePromo);
router.delete('/promos/:id', adminController.deletePromo);

router.post('/offers', validate(createOfferSchema), adminController.createOffer);
router.put('/offers/:id', validate(updateOfferSchema), adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

export default router;
