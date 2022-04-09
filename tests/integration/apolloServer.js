import { ApolloServer } from "apollo-server-express";
import { createSchema } from "~api/graphql";
import dataSources from "~api/graphql/datasources";
import otp from "~utils/otp";
import jwt from "~utils/jwt";
import mailer from "~utils/mailer";
import store from "~utils/store";
import fileStorage from "~utils/fileStorage";
import auth from "tests/support/auth";

const createApolloTestServer = () => {
  const schema = createSchema();
  const server = new ApolloServer({
    schema,
    dataSources,
    context: async (extraOptions = {}) => {
      const { currentUser, ...options } = extraOptions;
      let payload;

      if (currentUser) {
        payload = await auth.login(currentUser);
      }

      return {
        t: (msg) => msg,
        otp,
        jwt,
        store,
        fileStorage,
        mailer,
        clientId: process.env.WEB_CLIENT_ID,
        currentUser,
        ...(options || {}),
        ...(payload || {}),
      };
    },
  });

  return server;
};

export default createApolloTestServer;
