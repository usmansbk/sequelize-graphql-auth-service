import express from "express";
import startApolloServer from "~api/graphql";
import log from "~config/logger";
import { useLanguageMiddleware } from "~config/i18n";
import rateLimiter from "~middlewares/rateLimiter";

const app = express();

useLanguageMiddleware(app);

app.use(rateLimiter);

app.set("trust proxy", 1);
app.get("/ip", (request, response) => response.send(request.ip));

const main = async () => {
  try {
    const server = await startApolloServer(app);
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

main();
