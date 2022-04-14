import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";

const query = gql`
  mutation SignOutUser($id: ID!) {
    signOutUser(id: $id) {
      code
      message
    }
  }
`;

describe("Mutation.signOutUser", () => {
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

  test("should allow admin to signout other users", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const otherUser = await FactoryBot.create("user");
    const key = `${process.env.WEB_CLIENT_ID}:${otherUser.id}`;
    await cache.set(key, "mockToken", "1 minute");

    await server.executeOperation(
      {
        query,
        variables: {
          id: otherUser.id,
        },
      },
      { currentUser }
    );

    const deletedAuthData = await cache.get(key);
    expect(deletedAuthData).toBe(null);
  });

  test("should not allow non-admin to sign-out other users", async () => {
    const currentUser = await FactoryBot.create("user");
    const otherUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: otherUser.id,
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
