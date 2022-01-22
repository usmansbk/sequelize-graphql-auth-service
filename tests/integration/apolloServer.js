import { ApolloServer } from "apollo-server-express";
import { createSchema } from "~api/graphql";
import dataSources from "~api/graphql/datasources";
import otp from "~utils/otp";
import * as jwt from "~utils/jwt";
import store from "~utils/store";
import fileStorage from "~utils/fileStorage";

jest.mock("~utils/store");

const createApolloTestServer = () => {
  const schema = createSchema();
  const server = new ApolloServer({
    schema,
    dataSources,
    context: () => {
      return {
        t: (msg) => msg,
        otp,
        jwt,
        store,
        fileStorage,
        clientId: process.env.TEST_CLIENT_ID,
      };
    },
  });

  return server;
};

export default createApolloTestServer;
