import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
import "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  environment: process.env.NODE_ENV,
  enabled: process.env.NODE_ENV !== "test",
  tracesSampleRate: 1.0,
});

export default Sentry;
