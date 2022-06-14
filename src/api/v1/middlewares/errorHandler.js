import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-core";
import TokenError from "~utils/errors/TokenError";
import analytics from "~services/analytics";
import { SOMETHING_WENT_WRONG } from "~helpers/constants/responseCodes";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  analytics.flush();
  let statusCode;
  let { message } = err;
  if (err instanceof UserInputError) {
    statusCode = 400;
  } else if (err instanceof AuthenticationError || err instanceof TokenError) {
    statusCode = 401;
  } else if (err instanceof ForbiddenError) {
    statusCode = 403;
  } else {
    statusCode = 500;
    message = SOMETHING_WENT_WRONG;
  }

  res
    .status(statusCode)
    .json({
      success: false,
      message: req.t(message),
    })
    .end();
};

export default errorHandler;
