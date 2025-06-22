export default class AppError extends Error {
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
      switch (statusCode) {
        case 400:
          this.status = 'Bad Request';
          break;
        case 401:
          this.status = 'Unauthorized';
          break;
        case 403:
          this.status = 'Forbidden';
          break;
        case 404:
          this.status = 'Not Found';
          break;
        case 500:
          this.status = 'Internal Server Error';
          break;
        default:
          this.status = 'Error';
      }
      Error.captureStackTrace(this, this.constructor);
    }
  }