import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import db from "~db/models";
import log from "~config/logger";
import i18n, { useLanguageMiddleware } from "~config/i18n";
import redis from "~config/redis";
import * as jwt from "~utils/jwt";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { UserDS } from "./datasources";

export const app = express();

useLanguageMiddleware(app);

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
    context: async ({ req }) => {
      let userInfo;
      const token = req.headers.authorization;

      if (token) {
        try {
          userInfo = jwt.verify(token);
        } catch (e) {}
      }

      const language = userInfo?.language || req.language || req.locale;

      return {
        jwt,
        redis,
        userInfo,
        t: i18n(language),
        language,
        locale: req.locale,
      };
    },
  });
  return { server, httpServer };
};

const startApolloServer = async () => {
  const { server, httpServer } = createApolloServer();
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  await db.sequelize.authenticate();
  await db.sequelize.sync({ force: true });

  return server;
};

export default startApolloServer;
