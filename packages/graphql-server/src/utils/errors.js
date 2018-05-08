class ValidationError extends Error {
  code = 400;
  statusCode = 400;
  constructor(message) {
    super(message);
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { ValidationError };
