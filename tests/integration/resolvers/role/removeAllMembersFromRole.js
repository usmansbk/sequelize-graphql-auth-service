import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { ROLE_PERMISSIONS_PREFIX } from "~constants/auth";

const query = gql`
  mutation RemoveAllMembersFromRole($roleId: ID!) {
    removeAllMembersFromRole(roleId: $roleId) {
      code
      message
      role {
        members {
          items {
            id
          }
        }
      }
    }
  }
`;

describe("Mutation.removeAllMembersFromRole", () => {
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

      expect(res.data.removeAllMembersFromRole.role.members.items).toHaveLength(
        0
      );
    });

    test("should invalidate cache", async () => {
      const role = await FactoryBot.create("role");
      const key = `${ROLE_PERMISSIONS_PREFIX}:${role.id}`;
      await cache.setJSON(key, role.toJSON());

      await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
          },
        },
        { currentUser: admin }
      );

      const cleared = await cache.get(key);
      expect(cleared).toBe(null);
    });
  });
});
