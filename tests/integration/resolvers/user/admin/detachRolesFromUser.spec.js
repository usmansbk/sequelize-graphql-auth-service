import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { PERMISSIONS_KEY_PREFIX } from "~constants/auth";

const query = gql`
  mutation DetachRolesFromUser($userId: ID!, $roleIds: [ID!]!) {
    detachRolesFromUser(userId: $userId, roleIds: $roleIds) {
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

describe("Mutation.detachRolesFromUser", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
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

    test("should detach roles from user", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });
      await role.addMember(other);

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

      expect(res.data.attachRolesToUser.user.roles).toHaveLength(0);
    });

    test("should invalidate cached permissions", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });

      const key = `${PERMISSIONS_KEY_PREFIX}:${other.id}`;
      await cache.set({
        key,
        value: "mockPermissions",
      });

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
