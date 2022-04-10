import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";
import RoleFactory from "tests/factories/role";

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

  test("should allow admin to create user", async () => {
    const user = await UserFactory.create();
    const role = await RoleFactory.create({ name: "admin" });
    await user.addRole(role);
    const currentUser = await UserFactory.model
      .scope("permissions")
      .findByPk(user.id);

    const input = UserFactory.attributes();
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
    const user = await UserFactory.create();
    const currentUser = await UserFactory.model
      .scope("permissions")
      .findByPk(user.id);

    const input = UserFactory.attributes();
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
