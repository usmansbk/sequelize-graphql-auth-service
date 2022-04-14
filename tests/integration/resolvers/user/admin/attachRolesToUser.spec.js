import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { PERMISSIONS_KEY_PREFIX } from "~constants/auth";

const query = gql`
  mutation AttachRolesToUser($userId: ID!, $roleIds: [ID!]!) {
    attachRolesToUser(userId: $userId, roleIds: $roleIds) {
      code
      message
      user {
        roles {
          id
          name
        }
      }
    }
  }
`;

describe("Mutation.attachRolesToUser", () => {
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

    test("should attach roles to user", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });

      const res = await server.executeOperation(
        {
          query,
          variables: {
            userId: other.id,
            roleIds: [role.id],
          },
        },
        { currentUser: admin }
      );

      expect(res.data.attachRolesToUser.user.roles).toEqual([
        { name: "staff", id: role.id },
      ]);
    });

    test("should invalidate cached permissions", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });

      const key = `${PERMISSIONS_KEY_PREFIX}:${other.id}`;
      await cache.set(key, "mockPermissions", "1 minute");

      await server.executeOperation(
        {
          query,
          variables: {
            userId: other.id,
            roleIds: [role.id],
          },
        },
        { currentUser: admin }
      );

      const cachedPermissions = await cache.get(key);

      expect(cachedPermissions).toBe(null);
    });
  });
});
