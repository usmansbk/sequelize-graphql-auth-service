export const formatErrors = (errors, t) => {
  const formattedErrors = errors.map(({ path, message }) => ({
    field: path,
    message: t(message),
  }));

  return formattedErrors;
};

export default formatErrors;
