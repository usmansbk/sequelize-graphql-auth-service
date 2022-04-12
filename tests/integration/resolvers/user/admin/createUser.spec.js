import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

const query = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        id
        email
      }
    }
  }
`;

describe("Mutation.createUser", () => {
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

  test("should allow admin to create user", async () => {
    const currentUser = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });

    const input = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser }
    );
    expect(res.data.createUser.user.email).toBe(input.email);
  });

  test("should not allow non-admin to create user", async () => {
    const currentUser = await FactoryBot.create("user");

    const input = FactoryBot.attributesFor("user");
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser }
    );
    expect(res.errors[0].message).toMatch("Unauthorized");
  });
});
