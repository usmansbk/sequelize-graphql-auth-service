import { gql } from "apollo-server-express";
import db from "~db/models";
import createApolloTestServer from "tests/mocks/apolloServer";
import attributes from "tests/attributes";

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
    const user = await db.User.create(attributes.user());
    const role = await db.Role.create({ name: "admin" });
    await user.addRole(role);
    const currentUser = await db.User.scope("permissions").findByPk(user.id);
    const otherUser = await db.User.create(attributes.user());

    const { firstName, lastName } = attributes.user();
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
    const user = await db.User.create(attributes.user());
    const currentUser = await db.User.scope("permissions").findByPk(user.id);
    const otherUser = await db.User.create(attributes.user());

    const { firstName, lastName } = attributes.user();
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
