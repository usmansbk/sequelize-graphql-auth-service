import AbstractError from "./AbstractError";

/**
 * This class represents both "mutation" and "query" errors.
 */
export default class QueryError extends AbstractError {
  constructor(message, cause) {
    super(message, cause);
    this.name = this.constructor.name;
    this.code = message;
  }
}
