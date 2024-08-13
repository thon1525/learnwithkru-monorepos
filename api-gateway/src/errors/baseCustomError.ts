// Import the SerializedErrorOutput type from the specified path
import { SerializedErrorOutput } from "./@types/SerializedErrorOutput";

// Define an abstract class BaseCustomError that extends the built-in Error class in expressjs
export default abstract class BaseCustomError extends Error {
  // A protected property to hold the HTTP status code
  protected statusCode: number;

  // Constructor to initialize the error message and status code
  protected constructor(message: string, statusCode: number) {
    super(message); // Call the parent Error class constructor with the message
    this.statusCode = statusCode; // Assign the provided status code to the statusCode property

    // Ensure the correct prototype chain is maintained for instances of this class
    Object.setPrototypeOf(this, BaseCustomError.prototype);
  }

  // An abstract method that must be implemented by subclasses to return the status code
  abstract getStatusCode(): number;

  // An abstract method that must be implemented by subclasses to serialize the error output
  abstract serializeErrorOutput(): SerializedErrorOutput;
}
