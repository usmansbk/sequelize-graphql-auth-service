import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation DetachPermissionFromAllRoles($permissionId: ID!) {
    detachPermissionFromAllRoles(permissionId: $permissionId) {
      code
      message
      permission {
        roles {
          items {
            id
          }
        }
      }
    }
  }
`;

describe("Mutation.detachPermissionFromAllRoles", () => {
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

    test("should detach permission from all roles", async () => {
      const permission = await FactoryBot.create("permission", {
        include: {
          roles: {},
        },
      });

      const res = await server.executeOperation(
        {
          query,
          variables: {
            permissionId: permission.id,
          },
        },
        { currentUser: admin }
      );

      expect(
        res.data.detachPermissionFromAllRoles.permission.roles.items
      ).toHaveLength(0);
    });
  });
});
