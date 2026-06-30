import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(authenticate);
router.use(requireRole('admin'));

router.get('/users', adminController.getUsers);
router.get('/providers', adminController.getProviders);
router.get('/bookings', adminController.getBookings);
router.get('/disputes', adminController.getDisputes);
router.put('/disputes/:id', adminController.resolveDispute);
router.get('/stats', adminController.getPlatformStats);

router.post('/promos', adminController.createPromo);
router.put('/promos/:id', adminController.updatePromo);
router.delete('/promos/:id', adminController.deletePromo);

router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

export default router;
