import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import db from "~db/models";
import log from "~config/logger";
import redis from "~services/redis";
import * as jwt from "~utils/jwt";
import { loadTranslations, getTranslation } from "~i18n";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { UserDS } from "./datasources";

export const app = express();

export const createApolloServer = () => {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    logger: log,
    dataSources: () => ({
      users: new UserDS(db.User),
    }),
    context: async () => {
      const t = getTranslation("en");
      return {
        jwt,
        redis,
        t,
      };
    },
  });
  return { server, httpServer };
};

const startApolloServer = async () => {
  await loadTranslations();
  const { server, httpServer } = createApolloServer();
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  await db.sequelize.authenticate();
  // await db.sequelize.sync({ force: true });

  return server;
};

export default startApolloServer;
