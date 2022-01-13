import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import db from "~db/models";
import log from "~config/logger";
import i18n from "~config/i18n";
import * as jwt from "~utils/jwt";
import * as otp from "~utils/otp";
import store from "~services/store";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { UserDS } from "./datasources";

export const createApolloServer = (app) => {
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
      const accessToken = req.headers.authorization;

      if (accessToken) {
        userInfo = jwt.verify(accessToken);
      }

      const language = userInfo?.language || req.language || req.locale;

      return {
        jwt,
        store,
        userInfo,
        t: i18n(language),
        locale: req.locale,
        clientId: req.headers.client_id,
        accessToken,
        otp,
      };
    },
  });
  return { server, httpServer };
};

const startApolloServer = async (app) => {
  const { server, httpServer } = createApolloServer(app);
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => {
    httpServer.listen({ port: 4000 }, resolve);
  });
  await db.sequelize.authenticate();
  await db.sequelize.sync({ force: false });

  return server;
};

export default startApolloServer;
