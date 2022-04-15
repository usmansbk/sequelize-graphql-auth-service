import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation UpdatePermission($input: UpdatePermissionInput!) {
    updatePermission(input: $input) {
      code
      message
      permission {
        scope
      }
    }
  }
`;

describe("Mutation.updatePermission", () => {
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
    test("should update permission", async () => {
      const permission = await FactoryBot.create("permission", {
        scope: "read:posts",
      });

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input: {
              id: permission.id,
              scope: "write:posts",
            },
          },
        },
        { currentUser: admin }
      );

      expect(res.data.updatePermission.permission).toEqual({
        scope: "write:posts",
      });
    });
  });

  test("should not allow non-admin to update permission", async () => {
    const currentUser = await FactoryBot.create("user");
    const permission = await FactoryBot.create("permission");

    const { scope } = FactoryBot.attributesFor("permission");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: permission.id,
            scope,
          },
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
