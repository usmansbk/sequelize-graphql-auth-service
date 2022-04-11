import { AuthenticationError } from "apollo-server-core";
import analytics from "~services/analytics";
import { SOMETHING_WENT_WRONG } from "~constants/i18n";

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  analytics.flush();
  if (err instanceof AuthenticationError) {
    res
      .status(401)
      .json({
        success: false,
        message: req.t(err.message),
      })
      .end();
  } else {
    res
      .status(500)
      .json({
        success: false,
        message: req.t(SOMETHING_WENT_WRONG),
      })
      .end();
  }
};

export default errorHandler;
