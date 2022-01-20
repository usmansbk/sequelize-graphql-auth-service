import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import http from "http";
import logger from "~utils/logger";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import dataSources from "./datasources";
import authDirectiveTransformer from "./directives/auth";
import i18nErrorPlugin from "./plugins/i18nErrorPlugin";

const createSchema = () => {
  let schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  });

  schema = authDirectiveTransformer(schema, "auth");

  return schema;
};

export const createApolloServer = (app) => {
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
      let tokenInfo;
      let sessionId;
      const { authorization: accessToken, client_id: clientId } = req.headers;
      const { t, store, locale, jwt, otp, fileStorage } = req;

      if (accessToken) {
        try {
          tokenInfo = jwt.verify(accessToken);
          sessionId = await store.get(`${clientId}:${tokenInfo.sub}`);
          if (tokenInfo?.lng) {
            // check if logged in user has a preferred language and use it
            await req.i18n.changeLanguage(tokenInfo.lng);
          }
        } catch (e) {
          logger.warn(e.message);
        }
      }

      return {
        t,
        jwt,
        otp,
        store,
        locale,
        clientId,
        sessionId,
        tokenInfo,
        accessToken,
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
  return server;
};

export default startApolloServer;
