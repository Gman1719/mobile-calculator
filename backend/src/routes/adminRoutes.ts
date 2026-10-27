import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateJWT);
router.use(authorizeRoles('SYSTEM_ADMINISTRATOR'));

router.get('/stats', AdminController.getStats);
router.get('/organizations/pending', AdminController.getPendingOrganizations);
router.get('/organizations', AdminController.getAllOrganizations);
router.patch('/organizations/:id/verify', AdminController.verifyOrganization);
router.get('/users', AdminController.getUsers);
router.patch('/users/:id/status', AdminController.updateUserStatus);
router.get('/audit-logs', AdminController.getAuditLogs);

export default router;
