const formatErrors = (errors, t) => {
  const formattedErrors = errors.map(
    ({ path, message, validatorArgs, validatorName }) => ({
      field: path,
      message: t(message, { validatorArgs, validatorName }),
    })
  );

  return formattedErrors;
};

export default formatErrors;
