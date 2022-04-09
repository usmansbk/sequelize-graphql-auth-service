import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/integration/apolloServer";
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

  test("should allow root to create a new user", async () => {
    const rootUser = await db.sequelize.transaction(async (transaction) => {
      const user = await db.User.create(attributes.user(), { transaction });
      const root = await db.Role.create({ name: "root" }, { transaction });
      await user.addRole(root, { transaction });
      return user;
    });

    const input = attributes.user();
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input,
        },
      },
      { currentUser: rootUser, isRootUser: true }
    );
    expect(res.data.createUser.user.email).toBe(input.email);
  });
});
