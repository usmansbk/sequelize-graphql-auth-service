import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { ROLE_PERMISSIONS_PREFIX } from "~constants/auth";

const query = gql`
  mutation DeletePermission($id: ID!, $reason: String) {
    deletePermission(id: $id, reason: $reason) {
      code
      message
      id
    }
  }
`;

describe("Mutation.deletePermission", () => {
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
    test("should delete a permission", async () => {
      const permission = await FactoryBot.create("permission");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            id: permission.id,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.deletePermission.id).toBe(permission.id);
    });

    test("should delete permission with reason", async () => {
      const permission = await FactoryBot.create("permission");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            id: permission.id,
            reason: "testing",
          },
        },
        { currentUser: admin }
      );

      expect(res.data.deletePermission.id).toBe(permission.id);
    });

    test("should invalidate cache on delete", async () => {
      const role = await FactoryBot.create("role");
      const permission = await FactoryBot.create("permission");
      await role.addPermission(permission);
      const key = `${ROLE_PERMISSIONS_PREFIX}:${role.id}`;
      await cache.setJSON(key, role.toJSON());

      await server.executeOperation(
        {
          query,
          variables: {
            id: permission.id,
          },
        },
        { currentUser: admin }
      );

      const cleared = await cache.get(key);
      expect(cleared).toBe(null);
    });
  });

  test("should not allow non-admin to delete permission", async () => {
    const currentUser = await FactoryBot.create("user");
    const permission = await FactoryBot.create("permission");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: permission.id,
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
