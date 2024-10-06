import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggerMiddleware.name); // Use NestJS Logger

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const startTime = Date.now(); // Start time to track execution time

    res.on('finish', () => {
      // 'finish' event ensures logging after response is sent
      const { statusCode } = res;
      const endTime = Date.now();
      const executionTime = endTime - startTime;

      // Log the method, URL, status code, and execution time
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${executionTime}ms`,
      );
    });

    next(); // Continue to the next middleware/handler
  }
}
