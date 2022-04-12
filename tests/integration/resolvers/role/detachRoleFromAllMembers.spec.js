import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { PERMISSIONS_KEY_PREFIX } from "~constants/auth";

const query = gql`
  mutation DetachRoleFromAllMembers($roleId: ID!) {
    detachRoleFromAllMembers(roleId: $roleId) {
      code
      message
      role {
        members {
          id
        }
      }
    }
  }
`;

describe("Mutation.detachRoleFromAllMembers", () => {
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

    test("should detach role from all members", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {},
        },
      });

      const res = await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.attachRoleFromAllMembers.role.members).toHaveLength(0);
    });

    test("should invalidate members cached permissions", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });
      await role.addMember(other);

      const key = `${PERMISSIONS_KEY_PREFIX}:${other.id}`;
      await cache.set({
        key,
        value: "mockPermissions",
        expiresIn: 10000,
      });

      await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
          },
        },
        { currentUser: admin }
      );

      const cachedPermissions = await cache.get(key);

      expect(cachedPermissions).toBe(null);
    });
  });
});
