import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdateRole($input: UpdateRoleInput!) {
    updateRole(input: $input) {
      code
      message
      role {
        name
        description
      }
    }
  }
`;

describe("Mutation.updateRole", () => {
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
    test("should update role name", async () => {
      const role = await FactoryBot.create("role", { name: "staff" });
      const { name } = FactoryBot.attributesFor("role");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input: {
              id: role.id,
              name,
            },
          },
        },
        { currentUser: admin }
      );

      expect(res.data.updateRole.role).toEqual({
        name,
        description: role.description,
      });
    });

    test("should update role description", async () => {
      const role = await FactoryBot.create("role", { description: "staff" });
      const { description } = FactoryBot.attributesFor("role");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input: {
              id: role.id,
              description,
            },
          },
        },
        { currentUser: admin }
      );

      expect(res.data.updateRole.role).toEqual({
        name: role.name,
        description,
      });
    });
  });

  test("should not allow non-admin to update role", async () => {
    const currentUser = await FactoryBot.create("user");
    const role = await FactoryBot.create("role");

    const { name } = FactoryBot.attributesFor("role");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: role.id,
            name,
          },
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
