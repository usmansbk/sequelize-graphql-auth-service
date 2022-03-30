import QueryError from "./QueryError";

export default class FieldErrors extends QueryError {
  constructor(message, errors, cause) {
    super(message, cause);
    this.errors = errors;
  }
}
