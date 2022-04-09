import { ApolloServer } from "apollo-server-express";
import { createSchema } from "~api/graphql";
import dataSources from "~api/graphql/datasources";
import otp from "~utils/otp";
import jwt from "~utils/jwt";
import mailer from "~utils/mailer";
import store from "~utils/store";
import fileStorage from "~utils/fileStorage";

const clientId = process.env.WEB_CLIENT_ID;

const login = async (user) => {
  const { accessToken, sid, exp } = jwt.generateAuthTokens({
    aud: clientId,
    sub: user.id,
  });
  await store.set({
    key: `${clientId}:${user.id}`,
    value: sid,
    expiresIn: exp,
  });

  return {
    accessToken,
    sessionId: sid,
    tokenInfo: { sid, sub: user.id },
  };
};

const createApolloTestServer = () => {
  const schema = createSchema();
  const server = new ApolloServer({
    schema,
    dataSources,
    context: async ({ currentUser, isRootUser } = {}) => {
      let payload = {};

      if (currentUser) {
        payload = await login(currentUser);
      }

      return {
        t: (msg) => msg,
        otp,
        jwt,
        store,
        mailer,
        clientId,
        isRootUser,
        fileStorage,
        ...payload,
      };
    },
  });

  return server;
};

export default createApolloTestServer;
