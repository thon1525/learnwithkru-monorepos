import { DecodedUser } from '@auth/@types/AuthSignup';
import { ApiError } from '@auth/errors/ApiError';
import { BaseCustomError } from '@auth/errors/BaseCustomError';
import { decodedToken } from '@auth/utils/jwt';
import { logger } from '@auth/utils/logger';
import { StatusCode } from '@auth/utils/StatusCode';
import { NextFunction, Request, Response } from 'express';
export interface RequestWithUser extends Request {
  user: DecodedUser;
}
export const authorize = (requireRole: string[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.split(' ')[1] as string;
      const decodedUser: DecodedUser = await decodedToken(token); // Decodes JWT
      const { role } = decodedUser;
      // Check role
      const hasRequiredRole = Array.isArray(role)
        ? role.some((r) => requireRole.includes(r))
        : requireRole.includes(role);

      if (!hasRequiredRole) {
        throw new BaseCustomError(
          'Forbidden - Insufficient permissions',
          StatusCode.Forbidden
        );
      }

      // Assign user to request
      (req as RequestWithUser).user = decodedUser;
      next();
    } catch (error: unknown) {
      logger.error('Authorization error:', error);
      if (error instanceof BaseCustomError) {
        next(error);
      } else {
        next(
          new ApiError('Unauthorized - Invalid token', StatusCode.Unauthorized)
        );
      }
    }
  };
};
