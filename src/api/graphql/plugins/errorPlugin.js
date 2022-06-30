/* eslint-disable no-param-reassign */
import analytics from "~services/analytics";
import Sentry from "~services/sentry";
import log from "~utils/logger";

/**
 * https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry
 */
const errorPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        const { errors, context, operation } = requestContext;
        if (!operation) {
          return;
        }

        analytics.flush();
        errors.forEach((err) => {
          err.message = context.t(err.message);

          Sentry.captureException(err);
          log.error({ err });
        });
      },
    };
  },
};

export default errorPlugin;
