class HttpError extends Error {
  constructor(message, errorCode) {
    super(message);
    this.code = errorCode;

    console.error(`HttpError: ${message} (Code: ${errorCode})`);
  }
}

module.exports = HttpError;
