import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import { ROLE_PERMISSIONS_PREFIX } from "~constants/auth";
import cache from "~utils/cache";

const query = gql`
  mutation RemovePermissionsFromRole($roleId: ID!, $permissionIds: [ID!]!) {
    removePermissionsFromRole(roleId: $roleId, permissionIds: $permissionIds) {
      code
      message
      role {
        permissions {
          id
        }
      }
    }
  }
`;

describe("Mutation.removePermissionsFromRole", () => {
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

    test("should detach permission from role", async () => {
      const permission = await FactoryBot.create("permission");
      const role = await FactoryBot.create("role");
      await role.addPermission(permission);

      const res = await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
            permissionIds: [permission.id],
          },
        },
        { currentUser: admin }
      );

      expect(res.data.removePermissionsFromRole.role.permissions).toHaveLength(
        0
      );
    });
    cache;

    test("should invalidate cache", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          permissions: {},
        },
      });
      const key = `${ROLE_PERMISSIONS_PREFIX}:${role.id}`;
      await cache.setJSON(key, role.toJSON());

      await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
            permissionIds: [role.permissions[0].id],
          },
        },
        { currentUser: admin }
      );

      const cleared = await cache.get(key);
      expect(cleared).toBe(null);
    });
  });
});
