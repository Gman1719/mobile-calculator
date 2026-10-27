import { Router } from 'express';
import authRoutes from './authRoutes';
import donorRoutes from './donorRoutes';
import requestRoutes from './requestRoutes';
import inventoryRoutes from './inventoryRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/donors', donorRoutes);
router.use('/requests', requestRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/admin', adminRoutes);

export default router;
