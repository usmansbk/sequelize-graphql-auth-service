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
    await db.sequelize.close();
  });

  test("should allow admin to change user fullname", async () => {
    const currentUser = await db.User.create(attributes.user());
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
      { currentUser, isRootUser: true }
    );

    expect(res.data.changeUserFullname.user).toEqual({ firstName, lastName });
  });
});
