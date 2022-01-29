import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import http from "http";
import logger from "~utils/logger";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import dataSources from "./datasources";
import applyDirectives from "./directives";
import i18nErrorPlugin from "./plugins/i18nErrorPlugin";

export const createSchema = () => {
  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  return applyDirectives(schema);
};

const createApolloServer = (app) => {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    schema: createSchema(),
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      i18nErrorPlugin,
    ],
    logger,
    dataSources,
    context: async ({ req }) => {
      const {
        t,
        jwt,
        otp,
        files,
        store,
        mailer,
        locale,
        clientId,
        sessionId,
        tokenInfo,
        accessToken,
      } = req;

      return {
        t,
        jwt,
        otp,
        files,
        store,
        mailer,
        locale,
        clientId,
        sessionId,
        tokenInfo,
        accessToken,
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
  return server;
};

export default startApolloServer;
