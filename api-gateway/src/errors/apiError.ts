// user case:
// 1 Unexpected server Error
// 2 Fallback Error Handler
// 3 Generic Server Error

import { StatusCode } from "../utils/StatusCode";
import { SerializedErrorOutput } from "./@types/SerializedErrorOutput";
import BaseCustomError from "./baseCustomError";

export default class APIError extends BaseCustomError {
  constructor(
    message: string,
    statusCode: number = StatusCode.InternalServerError
  ) {
    super(message, statusCode);
    Object.setPrototypeOf(this, APIError.prototype);
  }
  getStatusCode(): number {
    return this.statusCode;
  }
  serializeErrorOutput(): SerializedErrorOutput {
    return { errors: [{ message: this.message }] };
  }
}
