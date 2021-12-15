import AbstractError from "./AbstractError";

export default class QueryError extends AbstractError {
  constructor(message) {
    super(message);
  }
}
