import { StatusCode } from '@auth/utils/StatusCode';
import { BaseCustomError } from './BaseCustomError';

export class ApiError extends BaseCustomError {
  constructor(
    message: string,
    statusCode: number = StatusCode.INTERNAL_SERVER_ERROR
  ) {
    super(message, statusCode);
  }
}
