import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { ROLE_PERMISSIONS_PREFIX } from "~helpers/constants/auth";

const query = gql`
  mutation AddPermissionsToRole($roleId: ID!, $permissionIds: [ID!]!) {
    addPermissionsToRole(roleId: $roleId, permissionIds: $permissionIds) {
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

describe("Mutation.addPermissionsToRole", () => {
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

    test("should attach permission to role", async () => {
      const permission = await FactoryBot.create("permission");
      const role = await FactoryBot.create("role");

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

      expect(res.data.addPermissionsToRole.role.permissions).toEqual([
        { id: permission.id },
      ]);
    });

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
