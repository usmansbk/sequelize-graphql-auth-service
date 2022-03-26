import { AuthenticationError } from "apollo-server-core";
import { SOMETHING_WENT_WRONG } from "~helpers/constants/i18n";

const errorHandler = (err, req, res, next) => {
  if (err instanceof AuthenticationError) {
    res.status(401).json({
      success: false,
      message: req.t(err.message),
    });
    next();
  } else {
    res.status(500).json({
      success: false,
      message: req.t(SOMETHING_WENT_WRONG),
    });
  }
};

export default errorHandler;
