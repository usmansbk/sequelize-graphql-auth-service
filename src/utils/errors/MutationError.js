import AbstractError from "./AbstractError";

export default class MutationError extends AbstractError {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}
