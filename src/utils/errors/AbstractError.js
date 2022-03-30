export default class AbstractError extends Error {
  constructor(message, cause) {
    super(message, cause);
    this.name = this.constructor.name;
    this.code = message;
    this.cause = cause;
  }
}
