import { gql } from "apollo-server-express";
import createApolloTestServer from "tests/mocks/apolloServer";
import FactoryBot from "tests/factories";

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

  afterEach(async () => {
    await FactoryBot.truncate();
  });

  test("should allow admin to change users fullname", async () => {
    const user = await FactoryBot.create("user", {
      include: {
        roles: {
          name: "admin",
        },
      },
    });
    const currentUser = await FactoryBot.db("user")
      .scope("permissions")
      .findByPk(user.id);
    const otherUser = await FactoryBot.create("user");

    const { firstName, lastName } = FactoryBot.attributesFor("user");
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
    const user = await FactoryBot.create("user");
    const currentUser = await FactoryBot.db("user")
      .scope("permissions")
      .findByPk(user.id);
    const otherUser = await FactoryBot.create("user");

    const { firstName, lastName } = FactoryBot.attributesFor("user");
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
