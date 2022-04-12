import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation CreateRole($input: CreateRoleInput!) {
    createRole(input: $input) {
      code
      message
      role {
        name
        permissions {
          id
        }
      }
    }
  }
`;

describe("Mutation.createRole", () => {
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
    test("should create a new role with no permission", async () => {
      const input = FactoryBot.attributesFor("role");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.createRole.role).toEqual({
        name: input.name,
        permissions: [],
      });
    });

    test("should create a new role with permission", async () => {
      const input = FactoryBot.attributesFor("role");
      const permission = await FactoryBot.create("permission");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input: {
              ...input,
              permissionIds: [permission.id],
            },
          },
        },
        { currentUser: admin }
      );

      expect(res.data.createRole.role).toEqual({
        name: input.name,
        permissions: [{ id: permission.id }],
      });
    });
  });

  test("should not allow non-admin to create role", async () => {
    const currentUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: FactoryBot.attributesFor("role"),
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
