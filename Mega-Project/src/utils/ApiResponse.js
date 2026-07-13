// ApiResponse: a standard wrapper for all successful API responses.
// Ensures every success response has the same shape across the whole app
// (statusCode, message, data) - frontend can always expect this structure.
class ApiResponse {
  constructor(statusCode, message = "Success", data) {
    this.statusCode = statusCode; // HTTP status code (e.g. 200, 201)
    this.message = message; // human-readable success message
    this.data = data; // the actual payload being sent back
  }
}

export { ApiResponse };
