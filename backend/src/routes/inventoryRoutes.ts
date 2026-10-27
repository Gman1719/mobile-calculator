import { Router } from 'express';
import { InventoryController } from '../controllers/inventoryController';
import { authenticateJWT } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

router.use(authenticateJWT);

router.get('/', authorizeRoles('BLOOD_BANK_OFFICER', 'HOSPITAL_STAFF', 'SYSTEM_ADMINISTRATOR'), InventoryController.getInventory);
router.get('/batches', authorizeRoles('BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'), InventoryController.getBatches);
router.get('/transactions', authorizeRoles('BLOOD_BANK_OFFICER', 'SYSTEM_ADMINISTRATOR'), InventoryController.getTransactions);
router.post('/receipts', authorizeRoles('BLOOD_BANK_OFFICER'), InventoryController.addReceipt);
router.post('/transactions/issue', authorizeRoles('BLOOD_BANK_OFFICER'), InventoryController.issueStock);

export default router;
