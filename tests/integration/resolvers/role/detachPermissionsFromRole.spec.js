import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation DetachPermissionsFromRole($roleId: ID!, $permissionIds: [ID!]!) {
    detachPermissionsFromRole(roleId: $roleId, permissionIds: $permissionIds) {
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

describe("Mutation.detachPermissionsFromRole", () => {
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

      expect(res.data.detachPermissionsFromRole.role.permissions).toHaveLength(
        0
      );
    });
  });
});
