class HttpError extends Error {
  code: number;
  originalError?: any; // Optional field to store original error information

  constructor(message: string, errorCode: number, originalError?: any) {
    super(message);
    this.code = errorCode;
    this.originalError = originalError;

    // Custom debugging output for errors
    console.error(`HttpError: ${message} (Code: ${errorCode})`);

    // If there is an original error, log it as well
    if (originalError) {
      console.error("Original error:", originalError);
    }
  }
}

export default HttpError;
