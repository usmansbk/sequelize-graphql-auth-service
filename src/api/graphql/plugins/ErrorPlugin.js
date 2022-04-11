import analytics from "~services/analytics";
import Sentry from "~services/sentry";

/**
 * https://blog.sentry.io/2020/07/22/handling-graphql-errors-using-sentry
 * This plugin translates the errors to the client request language
 * and logs errors to analytics
 */
const errorPlugin = {
  async requestDidStart() {
    return {
      async didEncounterErrors(requestContext) {
        const { errors, context, operation, request } = requestContext;
        analytics.flush();
        errors.forEach((e) => {
          Sentry.withScope((scope) => {
            // Annotate whether failing operation was query/mutation/subscription
            scope.setTag("kind", operation.operation);
            // Log query and variables as extras
            // (make sure to strip out sensitive data!)
            scope.setExtra("query", request.query);
            scope.setExtra("variables", request.variables);
            if (e.path) {
              scope.addBreadcrumb({
                category: "query-path",
                message: e.path.join(" > "),
                level: Sentry.Severity.Debug,
              });
            }
            const transactionId = request.http.headers.get("x-transaction-id");
            if (transactionId) {
              scope.setTransactionName(transactionId);
            }
            Sentry.captureException(e);
          });
          e.message = context.t(e.message);
        });
      },
    };
  },
};

export default errorPlugin;
