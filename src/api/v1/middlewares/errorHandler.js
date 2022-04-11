import { AuthenticationError } from "apollo-server-core";
import analytics from "~services/analytics";
import { SOMETHING_WENT_WRONG } from "~constants/i18n";
import Sentry from "~services/sentry";

const errorHandler = (err, req, res, next) => {
  analytics.flush();
  Sentry.captureException(err);
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
