import { FIELD_ERRORS } from "~helpers/constants/errors";
import QueryError from "./QueryError";

export default class FieldErrors extends QueryError {
  constructor(message, errors) {
    super(message, FIELD_ERRORS);
    this.errors = errors;
  }
}
