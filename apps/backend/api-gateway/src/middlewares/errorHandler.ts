import { Request, Response } from "express";
import { logger } from "../utils/logger";
import BaseCustomError from "../errors/baseCustomError";
import { StatusCode } from "../utils/StatusCode";
//errorHandler function is a custom error-handling middleware designed to handle errors All in expressjs error
const errorHandler = (err: Error, _req: Request, res: Response) => {
  logger.error(
    `Gateway 
        service`,
    err
  );
  // Check if the error is an instance of the custom error class
  if (err instanceof BaseCustomError) {
    return res.status(err.getStatusCode()).json(err.serializeErrorOutput());
  }
  // If the error is not an instance of the custom error class, send a generic error response
  return res
    .status(StatusCode.InternalServerError)
    .json({ errors: [{ message: "An unexpected error occurred" }] });
};

export default errorHandler;
