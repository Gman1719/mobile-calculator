import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { DonorService } from '../services/donorService';
import { BloodGroup } from '../types/enums';

export class DonorController {
  static async searchDonors(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bloodGroup, city, town } = req.query;
      const results = await DonorService.searchDonors({
        bloodGroup: bloodGroup as BloodGroup,
        city: city as string,
        town: town as string,
      });

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateAvailability(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId as string;
      const { isAvailable } = req.body;

      const result = await DonorService.updateAvailability(userId, isAvailable);
      return res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
