import express from "express";
import cors from "cors";
import v1 from "~api/v1/routes";
import db from "~db/models";
import startApolloServer from "~api/graphql";
import log from "~utils/logger";
import { useLanguageMiddleware } from "~config/i18n";
import contextMiddleware from "~api/v1/middlewares/context";
import rateLimiter from "~api/v1/middlewares/rateLimiter";
import errorHandler from "~api/v1/middlewares/errorHandler";

const app = express();

useLanguageMiddleware(app);

app.use(cors());
app.use(contextMiddleware);
app.use(rateLimiter);
app.use("/v1", v1);
app.use(errorHandler);

if (app.get("env") === "production") {
  // https://www.npmjs.com/package/express-rate-limit
  app.set("trust proxy", 1);
}

const main = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: false });
    log.info("Database connection has been established successfully.");
    const server = await startApolloServer(app);
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

main();
