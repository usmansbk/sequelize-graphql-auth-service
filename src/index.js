import startApolloServer from "~graph-api/";
import log from "~config/logger";

const app = async () => {
  try {
    const server = await startApolloServer();
    log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
  } catch (error) {
    log.error(error);
  }
};

app();
