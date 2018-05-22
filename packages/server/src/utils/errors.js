class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.code = 400;
    this.statusCode = 400;
    // Ensure the name of this error is the same as the class name
    this.name = this.constructor.name;
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { ValidationError };
