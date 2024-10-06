import { StatusCode } from '@notification/utils/StatusCode';
import { BaseCustomError } from './BaseCustomError';

export class ApiError extends BaseCustomError {
  constructor(
    message: string,
    statusCode: number = StatusCode.InternalServerError
  ) {
    super(message, statusCode);
  }
}
