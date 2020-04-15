const USER_ABORT_ERROR = 'UserAbortError';

export default class NamedError {
  static createUserAbortError(message?: string): Error {
    const error = new Error(message);
    error.name = USER_ABORT_ERROR;

    return error;
  }

  static isUserAbortError(error: Error): boolean {
    return error.name === USER_ABORT_ERROR;
  }
}
