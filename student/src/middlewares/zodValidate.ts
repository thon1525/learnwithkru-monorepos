import { NextFunction, Request, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { Logger } from '@nestjs/common'; // Use NestJS logger for consistency

// Utility function to format Zod validation errors
const formatZodErrors = (error: ZodError): string[] => {
  return error.errors.map(
    (issue) => `${issue.path.join('.')} is ${issue.message}`,
  );
};

// Zod validation middleware
export const zodValidate = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      // Validate the request body using Zod schema
      schema.parse(req.body);
      next(); // If validation succeeds, proceed to the next middleware or controller
    } catch (error) {
      if (error instanceof ZodError) {
        const errorMessages = formatZodErrors(error);
        res.status(422).json({ errors: errorMessages });
      }

      // Log unexpected errors using NestJS Logger
      Logger.error(
        'Unexpected validation error:',
        error instanceof Error ? error.stack : `${error}`,
      );

      // Return a generic internal server error response
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };
};
