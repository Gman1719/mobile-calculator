import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { RequestService } from '../services/requestService';
import { BloodGroup, RequestStatus, ResponseStatus } from '../types/enums';

export class RequestController {
  static async createRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requesterId = req.user!.userId as string;
      const result = await RequestService.createRequest({
        ...req.body,
        requesterId,
      });

      return res.status(201).json({
        success: true,
        message: 'Blood request created successfully',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async listRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { bloodGroup, city, status } = req.query;
      const results = await RequestService.listRequests({
        bloodGroup: bloodGroup as BloodGroup,
        city: city as string,
        status: status as RequestStatus,
      });

      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async respondToRequest(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const donorId = req.user!.userId as string;
      const { id } = req.params;
      const { responseStatus, notes } = req.body;

      const result = await RequestService.respondToRequest(
        id,
        donorId,
        responseStatus as ResponseStatus,
        notes
      );

      return res.status(200).json({
        success: true,
        message: 'Response recorded',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const result = await RequestService.updateRequestStatus(id, status as RequestStatus);
      return res.status(200).json({
        success: true,
        message: 'Request status updated',
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }
}
