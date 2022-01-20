import express from "express";
import v1 from "~api/v1/routes";
import db from "~db/models";
import startApolloServer from "~api/graphql";
import log from "~utils/logger";
import { useLanguageMiddleware } from "~config/i18n";
import contextMiddleware from "~api/v1/middlewares/context";
import rateLimiter from "~api/v1/middlewares/rateLimiter";

const app = express();

useLanguageMiddleware(app);

app.use(contextMiddleware);
app.use(rateLimiter);
app.use("/v1", v1);

if (app.get("env") === "production") {
  app.set("trust proxy", 1);
}

const main = async () => {
  try {
    await db.sequelize.authenticate();
    await db.sequelize.sync({ force: true });
    const server = await startApolloServer(app);
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

main();
