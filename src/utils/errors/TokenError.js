import AbstractError from "./AbstractError";

export default class TokenError extends AbstractError {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}
