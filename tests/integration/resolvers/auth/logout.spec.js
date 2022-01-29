import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
import attributes from "tests/attributes";
import jwt from "utils/jwt";
import store from "utils/store";

const query = gql`
  mutation Logout($all: Boolean) {
    logout(all: $all) {
      code
      success
      message
    }
  }
`;

describe("Mutation.logout", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
    await db.sequelize.close();
  });

  let user;
  let accessToken;
  const clientId = "test";
  beforeEach(async () => {
    user = await db.User.create(attributes.user());
    const tokens = jwt.generateAuthTokens({
      aud: clientId,
      sub: user.id,
    });
    accessToken = tokens.accessToken;
    await store.set({ key: `${clientId}:${user.id}`, value: tokens.sid });
  });

  test("should clear current user session", async () => {
    const res = await server.executeOperation(
      { query },
      { accessToken, clientId }
    );
    const sessionId = await store.get(`${clientId}:${user.id}`);
    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
    expect(sessionId).toBe(null);
  });

  test("should clear all current user sessions", async () => {
    const res = await server.executeOperation(
      {
        query,
        variables: {
          all: true,
        },
      },
      {
        accessToken,
        clientId,
      }
    );
    const sessionId = await store.get(`${clientId}:${user.id}`);

    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
    expect(sessionId).toBe(null);
  });
});
