const formatErrors = (errors, t) => {
  errors.forEach((e) => console.log(e));
  const formattedErrors = errors.map(
    ({ path, message, validatorArgs, validatorName }) => ({
      field: path,
      message: t(message, { validatorArgs, validatorName }),
    })
  );

  return formattedErrors;
};

export default formatErrors;
