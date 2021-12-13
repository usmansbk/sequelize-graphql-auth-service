export class ValidationError extends Error {
  constructor(message, errors, t) {
    super(message);
    this.name = "ValidationError";
    this.errors = formatErrors(errors, t);
  }
}

export function formatErrors(errors, t) {
  const formattedErrors = errors.map(({ path, message }) => ({
    field: path,
    message: t(message),
  }));

  return formattedErrors;
}
