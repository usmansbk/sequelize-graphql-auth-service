import "dotenv/config";
import express from "express";
import cors from "cors";
import Sentry from "~services/sentry";
import v1 from "~api/v1/routes";
import db from "~db/models";
import startApolloServer from "~api/graphql";
import log from "~utils/logger";
import { useLanguageMiddleware } from "~config/i18n";
import contextMiddleware from "~api/v1/middlewares/context";
import apiLimiter from "~api/v1/middlewares/apiLimiter";
import errorHandler from "~api/v1/middlewares/errorHandler";
import generateKeyPair from "~scripts/generateKayPair";

const app = express();

useLanguageMiddleware(app);

app.use(cors());
app.use(Sentry.Handlers.requestHandler());
app.use(apiLimiter);
app.use(contextMiddleware);
app.use("/v1", v1);

if (app.get("env") === "production") {
  // https://www.npmjs.com/package/express-rate-limit
  app.set("trust proxy", 1);
}

app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

const main = async () => {
  try {
    generateKeyPair();
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: false });
    log.info("Database connection has been established successfully.");
    const server = await startApolloServer(app);
    log.info(`🚀 Server ready at ${process.env.HOST}${server.graphqlPath}`);
  } catch (err) {
    Sentry.captureException(err);
    log.error({ err });
  }
};

main();
