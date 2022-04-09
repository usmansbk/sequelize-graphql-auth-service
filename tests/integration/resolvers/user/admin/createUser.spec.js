import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/mocks/apolloServer";
import attributes from "tests/attributes";

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
    await db.sequelize.close();
  });

  test("should allow admin to create a new user", async () => {
    const currentUser = await db.User.create(attributes.user());

    const input = attributes.user();
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser, isRootUser: true }
    );
    expect(res.data.createUser.user.email).toBe(input.email);
  });
});
