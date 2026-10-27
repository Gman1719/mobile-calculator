import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export function authorizeRoles(...allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User principal missing.',
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role as string));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Requires one of the following roles: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
}
