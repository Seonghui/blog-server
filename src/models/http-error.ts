class HttpError extends Error {
  code: number;

  constructor(message: string, errorCode: number) {
    super(message);
    this.code = errorCode;

    // Custom debugging output for errors
    console.error(`HttpError: ${message} (Code: ${errorCode})`);
  }
}

export default HttpError;
