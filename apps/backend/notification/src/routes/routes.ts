import express, { Router, Request, Response } from 'express';
import { StatusCode } from '@notification/utils/StatusCode';

const router: Router = express.Router();

// health
export function healthRoutes(): Router {
  router.get('/notification-health', (_req: Request, res: Response) => {
    res
      .status(StatusCode.OK)
      .json({ message: 'Notification service is healthy and OK' });
  });

  return router;
}
