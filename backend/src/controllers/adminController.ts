import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AdminService } from '../services/adminService';

export class AdminController {
  static async getPendingOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getPendingOrganizations();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAllOrganizations(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAllOrganizations();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async verifyOrganization(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId as string;
      const { id } = req.params;
      const { isVerified } = req.body;

      const result = await AdminService.verifyOrganization(id, isVerified, adminUserId);
      return res.status(200).json({
        success: true,
        message: isVerified ? 'Organization verified successfully' : 'Organization rejected / suspended',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getUsers(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getUsers();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateUserStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const adminUserId = req.user!.userId as string;
      const { id } = req.params;
      const { status } = req.body;

      const result = await AdminService.updateUserStatus(id, status, adminUserId);
      return res.status(200).json({
        success: true,
        message: `User status changed to ${status}`,
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getStats();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async getAuditLogs(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await AdminService.getAuditLogs();
      return res.status(200).json({ success: true, data });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}

