import { StatusCode } from '@notification/utils/StatusCode';
import { BaseCustomError } from './BaseCustomError';
import { SerializedErrorOutput } from './@types/serializedErrorOutput';

export default class DuplicateError extends BaseCustomError {
  constructor(message: string) {
    super(message, StatusCode.Conflict);

    Object.setPrototypeOf(this, DuplicateError.prototype);
  }

  getStatusCode(): number {
    return this.statusCode;
  }

  serializeErrorOutput(): SerializedErrorOutput {
    return { errors: [{ message: this.message }] };
  }
}
