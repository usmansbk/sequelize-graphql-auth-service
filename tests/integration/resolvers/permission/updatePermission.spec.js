import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdatePermission($input: UpdatePermissionInput!) {
    updatePermission(input: $input) {
      code
      message
      permission {
        name
        action
        resource
      }
    }
  }
`;

describe("Mutation.updatePermission", () => {
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
    test("should update permission", async () => {
      const permission = await FactoryBot.create("permission", {
        name: "ReadPosts",
        action: "read",
        resource: "posts",
      });

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input: {
              id: permission.id,
              name: "WriteBlogs",
              action: "write",
              resource: "blogs",
            },
          },
        },
        { currentUser: admin }
      );

      expect(res.data.updatePermission.permission).toEqual({
        name: "WriteBlogs",
        action: "write",
        resource: "blogs",
      });
    });
  });

  test("should not allow non-admin to update permission", async () => {
    const currentUser = await FactoryBot.create("user");
    const permission = await FactoryBot.create("permission");

    const { name } = FactoryBot.attributesFor("permission");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: permission.id,
            name,
          },
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
