import AbstractError from "./AbstractError";
import { formatErrors } from "./format";

export default class FieldErrors extends AbstractError {
  constructor(message, errors, t) {
    super(message);
    this.errors = formatErrors(errors, t);
  }
}
