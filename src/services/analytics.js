import Analytics from "analytics-node";

const { SEGMENT_WRITE_KEY, NODE_ENV } = process.env;

const analytics = new Analytics(SEGMENT_WRITE_KEY, {
  enable: NODE_ENV !== "test",
  flushAt: NODE_ENV === "production" ? 20 : 1,
});

export default analytics;
