import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { USER_PREFIX } from "~constants/auth";

const query = gql`
  mutation RemoveRolesFromUser($userId: ID!, $roleIds: [ID!]!) {
    removeRolesFromUser(userId: $userId, roleIds: $roleIds) {
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

describe("Mutation.removeRolesFromUser", () => {
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

      expect(res.data.removeRolesFromUser.user.roles).toHaveLength(0);
    });

    test("should invalidate cached permissions", async () => {
      const other = await FactoryBot.create("user");
      const role = await FactoryBot.create("role", {
        name: "staff",
      });

      const key = `${USER_PREFIX}:${other.id}`;
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
