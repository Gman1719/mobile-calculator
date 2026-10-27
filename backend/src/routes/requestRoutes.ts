import { Router } from 'express';
import { RequestController } from '../controllers/requestController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRoles('REQUESTER', 'HOSPITAL_STAFF'), RequestController.createRequest);
router.get('/', RequestController.listRequests);
router.get('/my-requests', RequestController.getMyRequests);
router.post('/:id/respond', authorizeRoles('DONOR'), RequestController.respondToRequest);
router.patch('/:id/status', RequestController.updateStatus);

export default router;
