import express from "express";
import startApolloServer from "~api/graphql";
import log from "~config/logger";
import { useLanguageMiddleware } from "~config/i18n";

const app = express();

useLanguageMiddleware(app);

const main = async () => {
  try {
    const server = await startApolloServer(app);
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

main();
