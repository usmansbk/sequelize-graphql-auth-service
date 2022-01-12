import AbstractError from "./AbstractError";

export default class QueryError extends AbstractError {
  constructor(message, cause) {
    super(message);
    this.cause = cause;
  }
}
