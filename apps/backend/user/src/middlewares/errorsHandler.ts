import { BaseCustomError } from '@user/errors/BaseCustomError';
import { Request, Response, NextFunction } from 'express';

export const errorHandler = async (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (error instanceof BaseCustomError) {
    const status = error.statusCode;
    res.status(status).json({
      success: false,
      errors: {
        message: error.message,
        statusCode: status,
      },
    });
  }
  _next();
};
