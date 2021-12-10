import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import db from "~db/models";
import log from "~config/logger";
import typeDefs from "./typeDefs";
import resolvers from "./resolvers";

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
  // await db.sequelize.sync({ force: true });
  log.info(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
};

export default startApolloServer;
