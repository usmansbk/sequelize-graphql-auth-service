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
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll((done) => {
    server.stop().then(done);
  });

  beforeEach(async () => {
    await FactoryBot.truncate();
  });

  test("should clear current user session", async () => {
    const currentUser = await FactoryBot.create("user");
    const res = await server.executeOperation({ query }, { currentUser });

    const sessionId = await cache.get(
      `${process.env.TEST_CLIENT_ID}:${currentUser.id}`
    );

    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
    expect(sessionId).toBe(null);
  });

  test("should clear all current user sessions", async () => {
    const currentUser = await FactoryBot.create("user");
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
      `${process.env.TEST_CLIENT_ID}:${currentUser.id}`
    );

    expect(res.data.logout).toEqual({
      code: "LoggedOut",
      success: true,
      message: "LoggedOut",
    });
    expect(sessionId).toBe(null);
  });
});
