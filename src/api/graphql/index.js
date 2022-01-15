import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import http from "http";
import db from "~db/models";
import log from "~utils/logger";
import * as jwt from "~utils/jwt";
import * as otp from "~utils/otp";
import store from "~utils/store";
import fileStorage from "~services/fileStorage";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import { UserDS, FileDS } from "./datasources";

export const createApolloServer = (app) => {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    logger: log,
    dataSources: () => ({
      users: new UserDS(db.User),
      files: new FileDS(db.File),
    }),
    context: async ({ req }) => {
      let tokenInfo;
      const accessToken = req.headers.authorization;

      if (accessToken) {
        try {
          tokenInfo = jwt.verify(accessToken);
          if (tokenInfo?.lng) {
            await req.i18n.changeLanguage(tokenInfo.lng);
          }
        } catch (e) {
          log.warn(e.message);
        }
      }

      return {
        jwt,
        store,
        tokenInfo,
        t: req.t,
        locale: req.locale,
        clientId: req.headers.client_id,
        accessToken,
        otp,
        fileStorage,
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
