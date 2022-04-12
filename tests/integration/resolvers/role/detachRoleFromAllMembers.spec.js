import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation DetachRoleFromAllMembers($roleId: ID!) {
    detachRoleFromAllMembers(roleId: $roleId) {
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

      expect(res.data.detachRoleFromAllMembers.role.members.items).toHaveLength(
        0
      );
    });
  });
});
