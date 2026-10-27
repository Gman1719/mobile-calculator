import { Router } from 'express';
import { DonorController } from '../controllers/donorController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/search', DonorController.searchDonors);
router.patch('/availability', authorizeRoles('DONOR'), DonorController.updateAvailability);

export default router;
