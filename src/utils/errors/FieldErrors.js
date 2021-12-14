import AbstractError from "./AbstractError";

export default class FieldErrors extends AbstractError {
  constructor(message, errors) {
    super(message);
    this.errors = errors;
  }
}
