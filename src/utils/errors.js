export class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

export function formatErrors(errors, t) {
  const formattedErrors = errors.map(({ path, message }) => ({
    field: path,
    message: t(message),
  }));

  return formattedErrors;
}
