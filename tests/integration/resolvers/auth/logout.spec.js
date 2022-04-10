import { gql } from "apollo-server-express";
import FactoryBot from "tests/factories";
import createApolloTestServer from "tests/mocks/apolloServer";
import cache from "~utils/cache";

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
  let currentUser;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  beforeEach(async () => {
    currentUser = await FactoryBot.create("user");
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should clear current user session", async () => {
    const res = await server.executeOperation({ query }, { currentUser });
    const sessionId = await cache.get(
      `${process.env.WEB_CLIENT_ID}:${currentUser.id}`
    );
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
        currentUser,
      }
    );
    const sessionId = await cache.get(
      `${process.env.WEB_CLIENT_ID}:${currentUser.id}`
    );

    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
    expect(sessionId).toBe(null);
  });
});
