import { ApolloServer } from "apollo-server-express";
import { createSchema } from "~api/graphql";
import dataSources from "~api/graphql/datasources";
import otp from "~utils/otp";
import * as jwt from "~utils/jwt";
import store from "~utils/store";
import fileStorage from "~utils/fileStorage";

jest.mock("~utils/store");
jest.mock("~utils/jwt");
jest.mock("~utils/fileStorage");

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
      };
    },
  });

  return server;
};

export default createApolloTestServer;
