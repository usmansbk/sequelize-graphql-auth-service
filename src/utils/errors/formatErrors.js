import i18n from "~i18n";

export function formatErrors(errors, locale) {
  const t = i18n(locale);

  const formattedErrors = errors.map(({ path, message }) => ({
    field: path,
    message: t(message),
  }));

  return formattedErrors;
}
