import { ApolloServer } from "apollo-server-express";
import { createSchema } from "~api/graphql";
import dataSources from "~api/graphql/datasources";
import otp from "~utils/otp";
import jwt from "~utils/jwt";
import mailer from "~utils/mailer";
import store from "~utils/store";
import files from "~utils/files";

const createApolloTestServer = () => {
  const schema = createSchema();
  const server = new ApolloServer({
    schema,
    dataSources,
    context: (extraOptions = {}) => {
      return {
        t: (msg) => msg,
        otp,
        jwt,
        store,
        files,
        mailer,
        clientId: "test",
        ...extraOptions,
      };
    },
  });

  return server;
};

export default createApolloTestServer;
