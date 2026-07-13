// ApiError: a custom Error class for consistent error responses across the app.
// Extends the built-in Error class so it still works with try-catch and Error.stack,
// but adds extra fields (statusCode, success, errors) needed for API responses.
class ApiError extends Error {
  constructor(
    statusCode, // HTTP status code for this error (e.g. 404, 500)
    message = "Something went wrong", // default message if none provided
    errors = [], // array of specific validation errors, if any
    stack = "" // optional custom stack trace
  ) {
    super(message); // call parent Error class constructor with the message

    this.statusCode = statusCode;
    this.data = null; // errors never carry a data payload
    this.message = message;
    this.success = false; // always false for an error — consistent with ApiResponse pattern
    this.errors = errors;

    if (stack) {
      // if a custom stack trace was passed in, use it
      this.stack = stack;
    } else {
      // otherwise, auto-generate a clean stack trace excluding this constructor itself
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export { ApiError };
