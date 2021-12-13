import startApolloServer from "~graph-api/";
import log from "~config/logger";
import * as i18n from "~i18n";

const app = async () => {
  try {
    await i18n.init();
    const server = await startApolloServer();
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

app();
