import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";
import db from "~db/models";
import log from "~config/logger";

const startApolloServer = async () => {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
  await server.start();
  server.applyMiddleware({ app });
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  await db.sequelize.authenticate();
  log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

export default startApolloServer;
