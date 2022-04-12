import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation CreateRole($id: ID!) {
    deleteRole(id: $id) {
      code
      message
      id
    }
  }
`;

describe("Mutation.deleteRole", () => {
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
    test("should delete a role", async () => {
      const role = FactoryBot.attributesFor("role");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            id: role.id,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.deleteRole.id).toBe(role.id);
    });
  });

  test("should not allow non-admin to create role", async () => {
    const currentUser = await FactoryBot.create("user");
    const role = await FactoryBot.create("role");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          id: role.id,
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
