import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";
import cache from "~utils/cache";
import { USER_PREFIX } from "~constants/auth";

const query = gql`
  mutation RemoveMembersFromRole($roleId: ID!, $userIds: [ID!]!) {
    removeUsersFromRole(roleId: $roleId, userIds: $userIds) {
      code
      message
    }
  }
`;

describe("Mutation.removeUsersFromRole", () => {
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

    test("should remove members from role", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {},
        },
      });

      await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
            userIds: role.members.map((member) => member.id),
          },
        },
        { currentUser: admin }
      );

      const count = await role.countMembers();

      expect(count).toBe(0);
    });

    test("should revoke session", async () => {
      const role = await FactoryBot.create("role", {
        include: {
          members: {},
        },
      });
      const key = `${USER_PREFIX}:${role.members[0].id}`;
      await cache.setJSON(key, role.members[0].toJSON());

      await server.executeOperation(
        {
          query,
          variables: {
            roleId: role.id,
            userIds: role.members.map((member) => member.id),
          },
        },
        { currentUser: admin }
      );

      const cleared = await cache.get(key);
      expect(cleared).toBe(null);
    });
  });
});
