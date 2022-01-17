import AbstractError from "./AbstractError";

/**
 * This class represents both "mutation" and "query" errors.
 */
export default class QueryError extends AbstractError {
  constructor(i18nKeyCode, cause) {
    super(i18nKeyCode);
    this.cause = cause;
    this.code = i18nKeyCode;
  }
}
