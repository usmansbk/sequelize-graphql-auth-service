import apolloServer from "~graph-api/";
import log from "~config/logger";

const server = async () => {
  try {
    await apolloServer();
  } catch (error) {
    log.error(error);
  }
};

server();
