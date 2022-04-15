import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation CreatePermission($input: CreatePermissionInput!) {
    createPermission(input: $input) {
      code
      message
      permission {
        scope
      }
    }
  }
`;

describe("Mutation.createPermission", () => {
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
    test("should create permission", async () => {
      const input = FactoryBot.attributesFor("permission");

      const res = await server.executeOperation(
        {
          query,
          variables: {
            input,
          },
        },
        { currentUser: admin }
      );

      expect(res.data.createPermission.permission).toEqual({
        scope: input.scope,
      });
    });
  });

  test("should not allow non-admin to create permission", async () => {
    const currentUser = await FactoryBot.create("user");

    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: FactoryBot.attributesFor("permission"),
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
