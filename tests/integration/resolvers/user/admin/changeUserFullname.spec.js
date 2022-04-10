import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import UserFactory from "tests/factories/user";
import RoleFactory from "tests/factories/role";

const query = gql`
  mutation ChangeUserFullname($input: ChangeUserFullnameInput!) {
    changeUserFullname(input: $input) {
      code
      message
      errors {
        field
        message
      }
      user {
        firstName
        lastName
      }
    }
  }
`;

describe("Mutation.changeUserFullname", () => {
  let server;
  beforeAll(() => {
    server = createApolloTestServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  test("should allow admin to change users fullname", async () => {
    const user = await UserFactory.create();
    const role = await RoleFactory.create({ name: "admin" });
    await user.addRole(role);
    const currentUser = await UserFactory.model
      .scope("permissions")
      .findByPk(user.id);
    const otherUser = await UserFactory.create();

    const { firstName, lastName } = UserFactory.attributes();
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            firstName,
            lastName,
          },
        },
      },
      { currentUser }
    );

    expect(res.data.changeUserFullname.user).toEqual({ firstName, lastName });
  });

  test("should not allow non-admin to change users fullname", async () => {
    const user = await UserFactory.create();
    const currentUser = await UserFactory.model
      .scope("permissions")
      .findByPk(user.id);
    const otherUser = await UserFactory.create();

    const { firstName, lastName } = UserFactory.attributes();
    const res = await server.executeOperation(
      {
        query,
        variables: {
          input: {
            id: otherUser.id,
            firstName,
            lastName,
          },
        },
      },
      { currentUser }
    );

    expect(res.errors[0].message).toBe("Unauthorized");
  });
});
