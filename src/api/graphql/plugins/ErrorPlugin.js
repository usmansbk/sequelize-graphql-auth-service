import analytics from "~services/analytics";

/**
 * This plugin translates the errors to the client request language
 * and logs errors to analytics
 */
const errorPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        const { errors, context } = requestContext;
        analytics.flush();
        errors.forEach((e) => {
          e.message = context.t(e.message);
        });
      },
    };
  },
};

export default errorPlugin;
