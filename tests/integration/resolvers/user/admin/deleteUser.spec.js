import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import { USER_PREFIX } from "~constants/auth";
import cache from "~utils/cache";

const query = gql`
  mutation DeleteUser($id: ID!, $reason: String) {
    deleteUser(id: $id, reason: $reason) {
      code
      message
      id
    }
  }
`;

describe("Mutation.deleteUser", () => {
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

  describe("admin", () => {
    let admin;
    beforeEach(async () => {
      admin = await FactoryBot.create("user", {
        include: {
          roles: {
            name: "admin",
          },
        },
      });
    });

    test("should delete a user", async () => {
      const user = await FactoryBot.create("user");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            id: user.id,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.deleteUser.id).toBe(user.id);
    });

    test("should delete a user with reason", async () => {
      const user = await FactoryBot.create("user");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            id: user.id,
            reason: "testing",
          },
        },
        { currentUser: admin }
      );

      expect(res.data.deleteUser.id).toBe(user.id);
    });

    test("should invalidate cache", async () => {
      const user = await FactoryBot.create("user");
      const key = `${USER_PREFIX}:${user.id}`;
      await cache.setJSON(key, user.toJSON());

      await server.executeOperation(
        {
          query,
          variables: {
            id: user.id,
          },
        },
        { currentUser: admin }
      );

      const cleared = await cache.get(key);
      expect(cleared).toBe(null);
    });
  });

  test("should not allow non-admin to delete user", async () => {
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
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
