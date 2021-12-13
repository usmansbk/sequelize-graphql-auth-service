export class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export function formatErrors(errors, locale) {
  const formattedErrors = errors.map(({ path, message }) => ({
    field: path,
    message,
  }));

  return formattedErrors;
}
