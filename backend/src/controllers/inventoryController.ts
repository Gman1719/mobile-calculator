import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { InventoryService } from '../services/inventoryService';

export class InventoryController {
  static async getInventory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.query;
      const inventory = await InventoryService.getInventory(organizationId as string);
      return res.status(200).json({ success: true, data: inventory });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async addReceipt(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId as string;
      const result = await InventoryService.addReceipt({
        ...req.body,
        performedByUserId: userId,
      });

      return res.status(201).json({
        success: true,
        message: 'Receipt logged successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async issueStock(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId as string;
      const result = await InventoryService.issueStock({
        ...req.body,
        performedByUserId: userId,
      });

      return res.status(200).json({
        success: true,
        message: 'Stock issued successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getBatches(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.query;
      const batches = await InventoryService.getBatches(organizationId as string);
      return res.status(200).json({ success: true, data: batches });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { organizationId } = req.query;
      const transactions = await InventoryService.getTransactions(organizationId as string);
      return res.status(200).json({ success: true, data: transactions });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

